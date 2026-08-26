import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      roomId,
      checkIn,
      checkOut,
      adults,
      childAges,
    } = body;

    // =========================================
    // 1. ตรวจข้อมูล
    // =========================================

    if (!roomId || !checkIn || !checkOut) {
      return NextResponse.json(
        {
          available: false,
          error: "ข้อมูลการจองไม่ครบ",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 2. ตรวจวันที่
    // =========================================

    if (checkIn >= checkOut) {
      return NextResponse.json(
        {
          available: false,
          error:
            "วันที่เช็คเอาท์ต้องมากกว่าวันเช็คอิน",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 3. ตรวจจำนวนผู้เข้าพัก
    // =========================================

    const adultCount = Number(adults ?? 0);

    const ages: number[] = Array.isArray(childAges)
      ? childAges.map(Number)
      : [];

    const youngChildren = ages.filter(
      (age) => age >= 0 && age <= 8
    ).length;

    const olderChildren = ages.filter(
      (age) => age >= 9 && age <= 13
    ).length;

    const adultChildren = ages.filter(
      (age) => age >= 14
    ).length;

    const effectiveAdults =
      adultCount + adultChildren;

    const totalGuests =
      adultCount + ages.length;

    // =========================================
    // 4. กฎเฉพาะบ้าน 4
    // =========================================

    if (roomId === "house4") {
      /*
       * ผู้ใหญ่จริง + เด็กอายุ 14+
       * ต้องไม่เกิน 4 คน
       */

      if (effectiveAdults > 4) {
        return NextResponse.json({
          available: false,
          reason: "guest_limit",
          message:
            "บ้านสุขใจรองรับผู้ใหญ่รวมสูงสุด 4 คน",
        });
      }

      /*
       * คนหลักประกอบด้วย
       *
       * ผู้ใหญ่
       * +
       * เด็กอายุ 9-13 ปี
       */

      const mainGuests =
        effectiveAdults + olderChildren;

      /*
       * คนหลักสูงสุด 4 คน
       */

      if (mainGuests > 4) {
        return NextResponse.json({
          available: false,
          reason: "guest_limit",
          message:
            "บ้านสุขใจรองรับผู้ใหญ่และเด็กอายุ 9 ปีขึ้นไป รวมสูงสุด 4 คน",
        });
      }

      /*
       * เมื่อคนหลักครบ 4 คน
       *
       * อนุญาตเด็ก 0-8 ปี
       * เพิ่มได้อีก 1 คนฟรี
       */

      if (
        mainGuests === 4 &&
        youngChildren > 1
      ) {
        return NextResponse.json({
          available: false,
          reason: "guest_limit",
          message:
            "เมื่อผู้ใหญ่และเด็กโตครบ 4 คนแล้ว สามารถเพิ่มเด็กอายุไม่เกิน 8 ปีได้อีก 1 คนฟรี",
        });
      }

      /*
       * จำนวนคนทั้งหมดสูงสุด 5
       *
       * คนที่ 5 ต้องเป็นเด็ก 0-8 ปี
       */

      if (totalGuests > 5) {
        return NextResponse.json({
          available: false,
          reason: "guest_limit",
          message:
            "บ้านสุขใจรองรับผู้เข้าพักสูงสุด 5 คน โดยคนที่ 5 ต้องเป็นเด็กอายุไม่เกิน 8 ปี",
        });
      }

      /*
       * ถ้ามีเด็กคนที่ 5
       * ต้องเป็นเด็กไม่เกิน 8 ปี
       */

      if (
        totalGuests === 5 &&
        youngChildren !== 1
      ) {
        return NextResponse.json({
          available: false,
          reason: "guest_limit",
          message:
            "ผู้เข้าพักคนที่ 5 ต้องเป็นเด็กอายุไม่เกิน 8 ปีเท่านั้น",
        });
      }
    }

    // =========================================
    // 5. กฎบ้าน 1-3
    // =========================================

    if (roomId !== "house4") {
      /*
       * ผู้ใหญ่จริงเกิน 3 คน = ห้าม
       */

      if (effectiveAdults > 3) {
        return NextResponse.json({
          available: false,
          reason: "guest_limit",
          message:
            "บ้านพักรองรับผู้ใหญ่สูงสุด 3 คนเท่านั้น กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง",
        });
      }

      /*
       * ผู้ใหญ่จริง 3 คน
       *
       * เด็กต้องเป็นเด็กเล็ก 0-8 ปี
       * และรับได้สูงสุด 1 คน
       */

      if (effectiveAdults === 3) {
        if (olderChildren > 0) {
          return NextResponse.json({
            available: false,
            reason: "guest_limit",
            message:
              "เมื่อมีผู้ใหญ่ 3 คน สามารถเข้าพักพร้อมเด็กอายุไม่เกิน 8 ปีได้เพียง 1 คนเท่านั้น เนื่องจากที่นอนเสริม 3 ฟุตถูกใช้สำหรับผู้ใหญ่คนที่ 3 แล้ว กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง",
          });
        }

        if (youngChildren > 1) {
          return NextResponse.json({
            available: false,
            reason: "guest_limit",
            message:
              "บ้านพักรองรับผู้ใหญ่ 3 คนและเด็กเล็กได้สูงสุด 1 คน กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง",
          });
        }
      }

      /*
       * ผู้ใหญ่จริง 2 คน
       *
       * เด็ก 9-13 ได้สูงสุด 1 คน
       */

      if (
        effectiveAdults === 2 &&
        olderChildren > 1
      ) {
        return NextResponse.json({
          available: false,
          reason: "guest_limit",
          message:
            "เด็กอายุ 9-13 ปี สามารถเข้าพักร่วมกับผู้ใหญ่ 2 คนได้สูงสุด 1 คนต่อบ้านพัก เนื่องจากต้องใช้ที่นอนเสริม กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง",
        });
      }

      /*
       * จำนวนคนทั้งหมด
       */

      if (totalGuests > 4) {
        return NextResponse.json({
          available: false,
          reason: "guest_limit",
          message:
            "จำนวนผู้เข้าพักเกินความจุของบ้านพัก กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง",
        });
      }
    }

    console.log(
      "GUEST CHECK PASSED"
    );

    console.log({
      roomId,
      adultCount,
      childAges: ages,
      youngChildren,
      olderChildren,
      adultChildren,
      effectiveAdults,
      totalGuests,
    });

    // =========================================
    // 6. ตรวจ Booking ที่มีอยู่
    //
    // confirmed = ล็อกบ้านตลอดเวลา
    //
    // pending = ล็อกบ้านเพียง 10 นาที
    // =========================================

    const pendingExpireTime = new Date(
      Date.now() - 10 * 60 * 1000
    ).toISOString();

    const {
      data: bookings,
      error: bookingError,
    } = await supabaseAdmin
      .from("bookings")
      .select(
        "id, booking_code, check_in, check_out, booking_status, created_at"
      )
      .eq("room_id", roomId)
      .or(
        `booking_status.eq.confirmed,and(booking_status.eq.pending,created_at.gt.${pendingExpireTime})`
      )
      .lt("check_in", checkOut)
      .gt("check_out", checkIn);

    if (bookingError) {
      console.error(
        "CHECK BOOKING ERROR =",
        bookingError
      );

      throw bookingError;
    }

    // =========================================
    // 7. ถ้ามี Booking ซ้อน
    // =========================================

    if (
      bookings &&
      bookings.length > 0
    ) {
      console.log(
        "พบการจองซ้ำ =",
        bookings
      );

      return NextResponse.json({
  available: false,
  reason: "booked",
  message:
    "วันที่ที่เลือกมีการจองแล้ว กรุณาเลือกวันอื่น",
});
    }

    // =========================================
    // 8. ตรวจวันที่ Admin ปิดรับจอง
    // =========================================

    const {
      data: blockedDates,
      error: blockedError,
    } = await supabaseAdmin
      .from("blocked_dates")
      .select(
        "id, room_id, blocked_date, reason"
      )
      .eq("room_id", roomId)
      .gte("blocked_date", checkIn)
      .lt("blocked_date", checkOut);

    if (blockedError) {
      console.error(
        "CHECK BLOCKED DATE ERROR =",
        blockedError
      );

      throw blockedError;
    }

    // =========================================
    // 9. ถ้ามีวันที่ถูกปิด
    // =========================================

    if (
      blockedDates &&
      blockedDates.length > 0
    ) {
      console.log(
        "พบวันที่ปิดรับจอง =",
        blockedDates
      );

      return NextResponse.json({
        available: false,
        reason: "blocked",
        message:
          "ช่วงวันที่ที่เลือกมีวันที่ปิดรับจอง",
        blockedDates,
      });
    }

    // =========================================
    // 10. ว่างทั้งหมด
    // =========================================

    console.log(
      "ช่วงวันที่นี้สามารถจองได้"
    );

    return NextResponse.json({
      available: true,
      message:
        "สามารถจองช่วงวันที่นี้ได้",
    });
  } catch (error) {
    console.error(
      "CHECK AVAILABILITY ERROR =",
      error
    );

    return NextResponse.json(
      {
        available: false,
        error:
          "ไม่สามารถตรวจสอบวันที่ว่างได้",
      },
      { status: 500 }
    );
  }
}