import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const roomId = searchParams.get("roomId");
    const month = searchParams.get("month");

    // =========================================
    // ตรวจข้อมูลที่ส่งเข้ามา
    // =========================================

    if (!roomId) {
      return NextResponse.json(
        {
          error: "ไม่พบข้อมูลบ้านพัก",
        },
        {
          status: 400,
        }
      );
    }

    if (!month) {
      return NextResponse.json(
        {
          error: "ไม่พบข้อมูลเดือน",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // ตรวจรูปแบบเดือน YYYY-MM
    // =========================================

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json(
        {
          error: "รูปแบบเดือนไม่ถูกต้อง",
        },
        {
          status: 400,
        }
      );
    }

    const [year, monthNumber] = month
      .split("-")
      .map(Number);

    const startDate =
      `${year}-${String(monthNumber).padStart(2, "0")}-01`;

    const nextMonth =
      monthNumber === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(monthNumber + 1).padStart(2, "0")}-01`;

    // =========================================
    // 1. ดึง Booking ของบ้านพักนี้
    // =========================================

    const {
      data: bookings,
      error: bookingError,
    } = await supabase
      .from("bookings")
      .select(
        "id, booking_code, room_id, check_in, check_out, booking_status"
      )
      .eq("room_id", roomId)
      .in("booking_status", [
        "pending",
        "confirmed",
      ])
      .lt("check_in", nextMonth)
      .gt("check_out", startDate);

    if (bookingError) {
      console.error(
        "AVAILABILITY BOOKING ERROR =",
        bookingError
      );

      throw bookingError;
    }

    // =========================================
    // 2. ดึงวันที่ Admin ปิดรับจอง
    // =========================================

    const {
      data: blockedRows,
      error: blockedError,
    } = await supabase
      .from("blocked_dates")
      .select(
        "id, room_id, blocked_date, reason"
      )
      .eq("room_id", roomId)
      .gte("blocked_date", startDate)
      .lt("blocked_date", nextMonth);

    if (blockedError) {
      console.error(
        "AVAILABILITY BLOCKED ERROR =",
        blockedError
      );

      throw blockedError;
    }

    // =========================================
    // 3. สร้างรายการวันที่ถูกจอง
    // =========================================

    const bookedDates: string[] = [];

    for (const booking of bookings ?? []) {
      const checkIn = new Date(
        `${booking.check_in}T00:00:00Z`
      );

      const checkOut = new Date(
        `${booking.check_out}T00:00:00Z`
      );

      for (
        let date = new Date(checkIn);
        date < checkOut;
        date.setUTCDate(
          date.getUTCDate() + 1
        )
      ) {
        const dateString =
          date.toISOString().slice(0, 10);

        if (
          dateString >= startDate &&
          dateString < nextMonth
        ) {
          bookedDates.push(dateString);
        }
      }
    }

    // =========================================
    // 4. สร้างรายการวันที่ "ปิดรับจอง"
    // =========================================

    const blockedDates: string[] = (
      blockedRows ?? []
    )
      .map((row) => row.blocked_date)
      .filter(Boolean);

    // =========================================
    // 5. ป้องกันข้อมูลซ้ำ
    // =========================================

    const uniqueBookedDates = [
      ...new Set(bookedDates),
    ];

    const uniqueBlockedDates = [
      ...new Set(blockedDates),
    ];

    // =========================================
    // 6. ส่งข้อมูลกลับ
    // =========================================

    console.log(
      "AVAILABILITY =",
      {
        roomId,
        month,
        bookedDates: uniqueBookedDates,
        blockedDates: uniqueBlockedDates,
      }
    );

    return NextResponse.json({
      roomId,

      month,

      // วันที่มีลูกค้าจอง
      bookedDates: uniqueBookedDates,

      // วันที่ Admin ปิดรับจอง
      blockedDates: uniqueBlockedDates,

      // รายละเอียดการปิดรับจอง
      blockedDetails: blockedRows ?? [],
    });

  } catch (error) {
    console.error(
      "AVAILABILITY ERROR =",
      error
    );

    return NextResponse.json(
      {
        error: "ไม่สามารถโหลดปฏิทินได้",
      },
      {
        status: 500,
      }
    );
  }
}