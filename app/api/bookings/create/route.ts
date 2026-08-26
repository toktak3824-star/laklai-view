import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // =========================================
    // 1. ตรวจสอบข้อมูลวันที่
    // =========================================

    if (!data.room_id) {
      return NextResponse.json(
        { error: "ไม่พบข้อมูลบ้านพัก" },
        { status: 400 }
      );
    }

    if (!data.check_in || !data.check_out) {
      return NextResponse.json(
        {
          error:
            "กรุณาระบุวันเช็คอินและเช็คเอาท์",
        },
        { status: 400 }
      );
    }

    if (data.check_in >= data.check_out) {
      return NextResponse.json(
        {
          error:
            "วันเช็คเอาท์ต้องอยู่หลังวันเช็คอิน",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 2. ตรวจสอบ Booking ที่มีอยู่
    //
    // confirmed = ล็อกบ้าน
    // pending = ล็อก 10 นาที
    // =========================================

    const pendingExpireTime = new Date(
      Date.now() - 10 * 60 * 1000
    ).toISOString();

    const {
      data: existingBookings,
      error: checkError,
    } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, booking_code, room_id, check_in, check_out, booking_status, created_at"
      )
      .eq("room_id", data.room_id)
      .or(
        `booking_status.eq.confirmed,and(booking_status.eq.pending,created_at.gt.${pendingExpireTime})`
      )
      .lt("check_in", data.check_out)
      .gt("check_out", data.check_in);

    if (checkError) {
      console.error(
        "CHECK BOOKING ERROR =",
        checkError
      );

      return NextResponse.json(
        {
          error:
            "ไม่สามารถตรวจสอบสถานะบ้านพักได้",
        },
        { status: 500 }
      );
    }

    // =========================================
    // 3. ถ้ามี Booking ชนกัน
    // =========================================

    if (
      existingBookings &&
      existingBookings.length > 0
    ) {
      const existingBooking =
        existingBookings[0];

      return NextResponse.json(
        {
          error:
            `บ้านพักนี้ถูกจองแล้วในช่วงวันที่ ${existingBooking.check_in} ถึง ${existingBooking.check_out}`,
        },
        { status: 409 }
      );
    }

    // =========================================
    // 4. ตรวจวันที่ Admin ปิดรับจอง
    // =========================================

    const {
      data: blockedDates,
      error: blockedError,
    } = await supabaseAdmin
      .from("blocked_dates")
      .select(
        "id, room_id, blocked_date, reason"
      )
      .eq("room_id", data.room_id)
      .gte("blocked_date", data.check_in)
      .lt("blocked_date", data.check_out);

    if (blockedError) {
      console.error(
        "CHECK BLOCKED DATE ERROR =",
        blockedError
      );

      return NextResponse.json(
        {
          error:
            "ไม่สามารถตรวจสอบวันที่ปิดรับจองได้",
        },
        { status: 500 }
      );
    }

    // =========================================
    // 5. ถ้ามีวันที่ปิดรับจอง
    // =========================================

    if (
      blockedDates &&
      blockedDates.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "ช่วงวันที่ที่เลือกมีวันที่ปิดรับจอง กรุณาเลือกวันอื่น",
        },
        { status: 409 }
      );
    }

    // =========================================
    // 6. สร้าง Booking
    // =========================================

    const {
      data: booking,
      error,
    } = await supabaseAdmin
      .from("bookings")
      .insert([data])
      .select()
      .single();

    // =========================================
    // 7. ตรวจสอบการสร้าง Booking
    // =========================================

    if (error) {
      console.error(
        "BOOKING ERROR =",
        error
      );

      return NextResponse.json(
        {
          error:
            "ไม่สามารถสร้างการจองได้",
        },
        { status: 500 }
      );
    }

    console.log(
      "BOOKING SUCCESS =",
      booking
    );

    // =========================================
    // 8. ส่งข้อมูลกลับไปยัง BookingForm
    // =========================================

    return NextResponse.json({
      success: true,
      booking,
    });

  } catch (error) {
    console.error(
      "CREATE BOOKING SERVER ERROR =",
      error
    );

    return NextResponse.json(
      {
        error:
          "เกิดข้อผิดพลาดในการสร้างการจอง",
      },
      { status: 500 }
    );
  }
}