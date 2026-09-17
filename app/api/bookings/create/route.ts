import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

import { rooms } from "@/data/rooms";
import { calculatePrice } from "@/utils/calculatePrice";
import {
  calculateNatureExperienceTotal,
  isNatureExperienceAvailable,
} from "@/utils/natureExperience";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // =========================================
    // 1. ตรวจสอบข้อมูลพื้นฐาน
    // =========================================

    if (!data.room_id) {
      return NextResponse.json(
        {
          error: "ไม่พบข้อมูลบ้านพัก",
        },
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
    // 2. ตรวจสอบบ้านพัก
    // =========================================

    const room = rooms.find(
      (item) => item.id === data.room_id
    );

    if (!room) {
      return NextResponse.json(
        {
          error: "ไม่พบบ้านพักที่เลือก",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 3. เตรียมข้อมูลผู้เข้าพัก
    // =========================================

    const adults = Number(data.adults ?? 0);

    const children = Number(
      data.children ?? 0
    );

    const childAges = Array.isArray(
      data.child_ages
    )
      ? data.child_ages.map(Number)
      : [];

    if (
      !Number.isInteger(adults) ||
      adults <= 0
    ) {
      return NextResponse.json(
        {
          error:
            "จำนวนผู้ใหญ่ไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isInteger(children) ||
      children < 0
    ) {
      return NextResponse.json(
        {
          error:
            "จำนวนเด็กไม่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    if (childAges.length !== children) {
      return NextResponse.json(
        {
          error:
            "ข้อมูลจำนวนเด็กและอายุเด็กไม่ตรงกัน",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 4. ตรวจสอบวันว่างของบ้านพัก
    //
    // confirmed = ล็อกบ้าน
    // pending = ล็อก 10 นาที
    // =========================================

    const pendingExpireTime =
      new Date(
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
    // 5. ถ้ามี Booking ชนกัน
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
    // 6. ตรวจวันที่ Admin ปิดรับจอง
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
      .gte(
        "blocked_date",
        data.check_in
      )
      .lt(
        "blocked_date",
        data.check_out
      );

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
    // 7. คำนวณราคาที่พักจาก Server
    //
    // ไม่ใช้ total_price จาก Browser
    // =========================================

    const bookingResult =
      calculatePrice(room, {
        roomId: room.id,
        checkIn: new Date(
          data.check_in
        ),
        checkOut: new Date(
          data.check_out
        ),
        adults,
        children,
        childAges,
      });

    const roomTotal =
      bookingResult.grandTotal;

    // =========================================
    // 8. ตรวจสอบ "วิถีบ้านป่า"
    // =========================================

    const natureExperienceSelected =
      data.nature_experience_selected === true;

    let natureExperienceDate:
      | string
      | null = null;

    let natureExperienceParticipants = 0;

    let natureExperienceTotal = 0;

    if (natureExperienceSelected) {
      natureExperienceDate =
        data.nature_experience_date;

      natureExperienceParticipants =
        Number(
          data.nature_experience_participants ??
            0
        );

      // -----------------------------
      // ต้องมีวันที่กิจกรรม
      // -----------------------------

      if (!natureExperienceDate) {
        return NextResponse.json(
          {
            error:
              "กรุณาระบุวันที่กิจกรรมวิถีบ้านป่า",
          },
          { status: 400 }
        );
      }

      // -----------------------------
      // วันที่กิจกรรมต้องอยู่ในช่วงเข้าพัก
      // -----------------------------

      if (
        natureExperienceDate <
          data.check_in ||
        natureExperienceDate >=
          data.check_out
      ) {
        return NextResponse.json(
          {
            error:
              "วันที่กิจกรรมต้องอยู่ภายในช่วงวันที่เข้าพัก",
          },
          { status: 400 }
        );
      }

      // -----------------------------
      // ตรวจว่าวันนี้เปิดกิจกรรมหรือไม่
      // -----------------------------

      if (
        !isNatureExperienceAvailable(
          natureExperienceDate
        )
      ) {
        return NextResponse.json(
          {
            error:
              "วันที่เลือกไม่สามารถจัดกิจกรรมวิถีบ้านป่าได้",
          },
          { status: 400 }
        );
      }

      // -----------------------------
      // ตรวจจำนวนผู้เข้าร่วม
      // -----------------------------

      if (
        !Number.isInteger(
          natureExperienceParticipants
        ) ||
        natureExperienceParticipants <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "จำนวนผู้เข้าร่วมกิจกรรมไม่ถูกต้อง",
          },
          { status: 400 }
        );
      }

      // ป้องกันการส่งจำนวนผิดปกติจาก Browser
      if (
        natureExperienceParticipants >
        20
      ) {
        return NextResponse.json(
          {
            error:
              "จำนวนผู้เข้าร่วมกิจกรรมเกินจำนวนที่ระบบรองรับ",
          },
          { status: 400 }
        );
      }

      // -----------------------------
      // คำนวณราคากิจกรรม
      //
      // 899 บาท / คน
      // -----------------------------

      natureExperienceTotal =
        calculateNatureExperienceTotal(
          natureExperienceDate,
          natureExperienceParticipants,
          true
        );

      if (
        natureExperienceTotal <= 0
      ) {
        return NextResponse.json(
          {
            error:
              "ไม่สามารถคำนวณราคากิจกรรมได้",
          },
          { status: 400 }
        );
      }
    }

    // =========================================
    // 9. รวมยอดจาก Server
    // =========================================

    const finalTotalPrice =
      roomTotal +
      natureExperienceTotal;

    // =========================================
    // 10. สร้าง Booking Code
    // =========================================

    const bookingCode =
      data.booking_code ||
      `LKV-${new Date()
        .getFullYear()
        .toString()
        .slice(-2)}${String(
        new Date().getMonth() + 1
      ).padStart(2, "0")}${String(
        new Date().getDate()
      ).padStart(2, "0")}-${Date.now()
        .toString()
        .slice(-4)}`;

    // =========================================
    // 11. เตรียมข้อมูลที่จะบันทึก
    //
    // เราไม่เอา data จาก Browser
    // ไป insert ทั้งก้อนแล้ว
    // =========================================

    const bookingData = {
      room_id: room.id,

      guest_name:
        String(data.guest_name ?? "").trim(),

      email:
        String(data.email ?? "").trim(),

      phone:
        String(data.phone ?? "").trim(),

      check_in: data.check_in,

      check_out: data.check_out,

      adults,

      children,

      child_ages: childAges,

      // ใช้ราคาที่ Server คำนวณ
      total_price: finalTotalPrice,

      booking_status: "pending",

      payment_status: "waiting",

      slip_url: "",

      booking_code: bookingCode,

      // =====================================
      // วิถีบ้านป่า
      // =====================================

      nature_experience_selected:
        natureExperienceSelected,

      nature_experience_date:
        natureExperienceDate,

      nature_experience_participants:
        natureExperienceParticipants,

      nature_experience_total:
        natureExperienceTotal,
    };

    // =========================================
    // 12. บันทึก Booking
    // =========================================

    const {
      data: booking,
      error,
    } = await supabaseAdmin
      .from("bookings")
      .insert([bookingData])
      .select()
      .single();

    // =========================================
    // 13. ตรวจสอบผลการบันทึก
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
    // 14. ส่งผลกลับไป BookingForm
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