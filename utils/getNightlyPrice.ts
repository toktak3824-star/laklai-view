import type { Room } from "@/types/room";
import type { BookingRequest } from "@/types/booking";

import { calculatePrice } from "./calculatePrice";

/**
 * แปลงวันที่จากรูปแบบ YYYY-MM-DD
 * ให้เป็น Date แบบ local time
 *
 * ไม่ใช้ new Date("YYYY-MM-DD")
 * โดยตรง เพราะอาจเกิดปัญหา timezone
 */
function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
}

/**
 * คำนวณราคาห้องพักต่อคืน
 *
 * ใช้ calculatePrice.ts ของระบบเดิม
 * เป็นตัวกำหนดราคาจริง
 *
 * การคำนวณนี้ใช้:
 * - ผู้ใหญ่ 2 คน
 * - เด็ก 0 คน
 * - ไม่มีเด็ก
 * - พัก 1 คืน
 *
 * ดังนั้นราคาที่ได้คือ
 * ราคาห้องพักสำหรับผู้เข้าพักมาตรฐาน
 * ของวันที่ระบุ
 */
export function getNightlyPrice(
  room: Room,
  date: string
): number {
  /*
   * วันที่เข้าพัก
   */
  const checkInDate =
    parseLocalDate(date);

  /*
   * วันที่ออก
   *
   * พัก 1 คืน
   */
  const checkOutDate =
    new Date(checkInDate);

  checkOutDate.setDate(
    checkOutDate.getDate() + 1
  );

  /*
   * สร้าง BookingRequest
   *
   * checkIn / checkOut เป็น Date
   * ตาม type จริงของโปรเจกต์
   */
  const booking: BookingRequest = {
    roomId: room.id,

    checkIn: checkInDate,

    checkOut: checkOutDate,

    adults: 2,

    children: 0,

    childAges: [],
  };

  /*
   * ให้ calculatePrice เป็นผู้คำนวณราคา
   *
   * ไม่สร้างราคาขึ้นมาใหม่ตรงนี้
   */
  const result =
    calculatePrice(
      room,
      booking
    );

  /*
   * เราคำนวณเพียง 1 คืน
   *
   * ดังนั้นราคาของคืนที่ต้องการ
   * จะอยู่ใน breakdown รายการแรก
   */
  return (
    result.breakdown[0]?.price ?? 0
  );
}

/**
 * คำนวณราคาของช่วงวันที่เข้าพัก
 *
 * ใช้ calculatePrice.ts
 * โดยตรงเช่นเดียวกัน
 *
 * ใช้เมื่อเราต้องการราคาทั้งช่วงเข้าพัก
 * ไม่ใช่แค่คืนเดียว
 */
export function getStayPrice(
  room: Room,
  checkIn: string,
  checkOut: string
) {
  /*
   * แปลง YYYY-MM-DD
   * เป็น Date ก่อนส่งให้ BookingRequest
   */
  const checkInDate =
    parseLocalDate(checkIn);

  const checkOutDate =
    parseLocalDate(checkOut);

  /*
   * BookingRequest ของระบบ
   *
   * ต้องใช้ Date
   * และ children เป็น required
   */
  const booking: BookingRequest = {
    roomId: room.id,

    checkIn: checkInDate,

    checkOut: checkOutDate,

    adults: 2,

    children: 0,

    childAges: [],
  };

  /*
   * ใช้ระบบคำนวณราคาเดิม
   */
  return calculatePrice(
    room,
    booking
  );
}