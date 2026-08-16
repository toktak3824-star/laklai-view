import { supabase } from "./supabase";

export async function createBooking(data: any) {
  // =========================================
  // 1. ตรวจสอบข้อมูลวันที่
  // =========================================

  if (!data.room_id) {
    throw new Error("ไม่พบข้อมูลบ้านพัก");
  }

  if (!data.check_in || !data.check_out) {
    throw new Error("กรุณาระบุวันเช็คอินและเช็คเอาท์");
  }

  if (data.check_in >= data.check_out) {
    throw new Error("วันเช็คเอาท์ต้องอยู่หลังวันเช็คอิน");
  }

  // =========================================
  // 2. ตรวจสอบว่าบ้านพักถูกจองช่วงนี้แล้วหรือไม่
  //
  // confirmed = ล็อกบ้านตลอดจนกว่าจะยกเลิก
  //
  // pending = ล็อกบ้านเพียง 10 นาที
  // =========================================

  const pendingExpireTime = new Date(
    Date.now() - 10 * 60 * 1000
  ).toISOString();

  const {
    data: existingBookings,
    error: checkError,
  } = await supabase
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

    throw checkError;
  }

  // =========================================
  // 3. ถ้ามีการจองชนกัน ให้หยุดทันที
  // =========================================

  if (
    existingBookings &&
    existingBookings.length > 0
  ) {
    const existingBooking =
      existingBookings[0];

    console.error(
      "ROOM ALREADY BOOKED =",
      existingBooking
    );

    throw new Error(
      `บ้านพักนี้ถูกจองแล้วในช่วงวันที่ ${existingBooking.check_in} ถึง ${existingBooking.check_out}`
    );
  }

  // =========================================
  // 4. ตรวจสอบวันที่ Admin ปิดรับจอง
  // =========================================

  const {
    data: blockedDates,
    error: blockedError,
  } = await supabase
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

    throw blockedError;
  }

  // =========================================
  // 5. ถ้ามีวันที่ Admin ปิดรับจอง
  // =========================================

  if (
    blockedDates &&
    blockedDates.length > 0
  ) {
    console.error(
      "พบวันที่ปิดรับจอง =",
      blockedDates
    );

    throw new Error(
      "ช่วงวันที่ที่เลือกมีวันที่ปิดรับจอง กรุณาเลือกวันอื่น"
    );
  }

  // =========================================
  // 6. สร้างการจองใหม่
  // =========================================

  const {
    data: booking,
    error,
  } = await supabase
    .from("bookings")
    .insert([data])
    .select()
    .single();

  // =========================================
  // 7. ตรวจสอบข้อผิดพลาดจากการสร้าง Booking
  // =========================================

  if (error) {
    console.error(
      "BOOKING ERROR =",
      error
    );

    throw error;
  }

  console.log(
    "BOOKING SUCCESS =",
    booking
  );

  return booking;
}