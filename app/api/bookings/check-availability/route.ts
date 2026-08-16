import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 2. ตรวจวันที่
    // =========================================

    if (checkIn >= checkOut) {
      return NextResponse.json(
        {
          available: false,
          error: "วันที่เช็คเอาท์ต้องมากกว่าวันเช็คอิน",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
// 2.5 ตรวจจำนวนผู้เข้าพัก
// =========================================

const adultCount = Number(adults ?? 0);

const ages: number[] = Array.isArray(childAges)
  ? childAges.map(Number)
  : [];

// เด็ก 0-8 ปี = เด็กเล็ก / ฟรี
const youngChildren = ages.filter(
  (age) => age >= 0 && age <= 8
).length;

// เด็ก 9-13 ปี = เด็กโต / 350 บาท
const olderChildren = ages.filter(
  (age) => age >= 9 && age <= 13
).length;

// อายุ 14 ปีขึ้นไป = ผู้ใหญ่
const adultChildren = ages.filter(
  (age) => age >= 14
).length;

// ผู้ใหญ่ที่ระบบต้องถือว่าเป็นผู้ใหญ่จริง
const effectiveAdults =
  adultCount + adultChildren;

// =========================================
// กฎที่ 1
// ผู้ใหญ่จริงเกิน 3 คน = ห้าม
// =========================================

if (effectiveAdults > 3) {
  return NextResponse.json({
    available: false,
    reason: "guest_limit",
    message:
      "บ้านพักรองรับผู้ใหญ่สูงสุด 3 คนเท่านั้น กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง",
  });
}

// =========================================
// กฎที่ 2
// ผู้ใหญ่จริง 3 คน
// เด็กต้องเป็นเด็กเล็ก 0-8 ปีเท่านั้น
// และรับเด็กได้สูงสุด 1 คน
// =========================================

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

// =========================================
// กฎที่ 3
// ผู้ใหญ่จริง 2 คน
// เด็กโต 9-13 ปีได้สูงสุด 1 คน
// =========================================

if (effectiveAdults === 2 && olderChildren > 1) {
  return NextResponse.json({
    available: false,
    reason: "guest_limit",
    message:
      "เด็กอายุ 9-13 ปี สามารถเข้าพักร่วมกับผู้ใหญ่ 2 คนได้สูงสุด 1 คนต่อบ้านพัก เนื่องจากต้องใช้ที่นอนเสริม กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง",
  });
}

// =========================================
// กฎที่ 4
// จำนวนคนทั้งหมดต้องไม่เกิน 4 คน
// =========================================

const totalGuests =
  adultCount + ages.length;

if (totalGuests > 4) {
  return NextResponse.json({
    available: false,
    reason: "guest_limit",
    message:
      "จำนวนผู้เข้าพักเกินความจุของบ้านพัก กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง",
  });
}

console.log("GUEST CHECK PASSED");
console.log({
  adultCount,
  childAges: ages,
  youngChildren,
  olderChildren,
  adultChildren,
  effectiveAdults,
  totalGuests,
});

    console.log("CHECK AVAILABILITY");
    console.log("roomId =", roomId);
    console.log("checkIn =", checkIn);
    console.log("checkOut =", checkOut);

// =========================================
// 4. ตรวจ Booking ที่มีอยู่
//
// confirmed = ล็อกบ้านตลอดเวลา
//
// pending = ล็อกบ้านเพียง 10 นาที
// ถ้าเกิน 10 นาทีแล้ว จะไม่ถือว่าล็อกบ้าน
// =========================================

const pendingExpireTime = new Date(
  Date.now() - 10 * 60 * 1000
).toISOString();

const { data: bookings, error: bookingError } =
  await supabase
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
// 5. ถ้ามี Booking ซ้อน
// =========================================

if (bookings && bookings.length > 0) {
  console.log(
    "พบการจองซ้ำ =",
    bookings
  );

  return NextResponse.json({
    available: false,
    reason: "booked",
    message:
      "วันที่ที่เลือกมีการจองแล้ว กรุณาเลือกวันอื่น",
    bookings,
  });
}

// =========================================
// 6. ตรวจวันที่ Admin ปิดรับจอง
// =========================================

const { data: blockedDates, error: blockedError } =
  await supabase
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
// 7. ถ้ามีวันที่ถูกปิด
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
// 8. ว่างทั้งหมด
// =========================================

console.log(
  "ช่วงวันที่นี้สามารถจองได้"
);

return NextResponse.json({
  available: true,
  message: "สามารถจองช่วงวันที่นี้ได้",
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
      {
        status: 500,
      }
    );
  }
}