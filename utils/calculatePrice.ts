import type { Room } from "@/types/room";
import type {
  BookingRequest,
  BookingResult,
  PriceBreakdownItem,
} from "@/types/booking";

import {
  getStayDates,
  isHoliday,
  formatDate,
} from "./dateUtils";

export function calculatePrice(
  room: Room,
  booking: BookingRequest
): BookingResult {
  const stayDates = getStayDates(
    booking.checkIn,
    booking.checkOut
  );

  let weekdayNights = 0;
  let holidayNights = 0;

  let roomTotal = 0;

  const breakdown: PriceBreakdownItem[] =
    stayDates.map((date) => {
      const holiday = isHoliday(date);

      const price = holiday
        ? room.pricing.holiday
        : room.pricing.weekday;

      if (holiday) {
        holidayNights++;
      } else {
        weekdayNights++;
      }

      roomTotal += price;

      return {
        date: formatDate(date),
        type: holiday
          ? ("holiday" as const)
          : ("weekday" as const),
        price,
      };
    });

  /*
   * ==========================================
   * จัดกลุ่มอายุเด็ก
   * ==========================================
   *
   * 0-8   = ฟรี
   * 9-13  = 350 บาท
   * 14+   = ผู้ใหญ่
   */

  const childAges = booking.childAges ?? [];

  const freeChildren = childAges.filter(
    (age) => age >= 0 && age <= 8
  ).length;

  const paidChildren = childAges.filter(
    (age) => age >= 9 && age <= 13
  ).length;

  const adultChildren = childAges.filter(
    (age) => age >= 14
  ).length;

  /*
   * เด็กอายุ 14 ปีขึ้นไป
   * ให้เปลี่ยนสถานะเป็นผู้ใหญ่
   */
  const effectiveAdults =
    booking.adults + adultChildren;

  /*
   * ==========================================
   * จำนวนผู้เข้าพักทั้งหมด
   * ==========================================
   */

  const totalGuests =
    booking.adults + childAges.length;

  /*
   * ==========================================
   * ผู้ใหญ่ที่เกิน 2 คน
   * ==========================================
   */

  const extraAdults = Math.max(
    0,
    effectiveAdults - room.defaultGuests
  );

  const extraAdultTotal =
    extraAdults * room.extraAdultPrice;

  /*
   * ==========================================
   * ค่าเด็ก 9-13 ปี
   * ==========================================
   */

  const extraChildTotal =
    paidChildren * room.extraChildBedPrice;

  /*
   * ==========================================
   * ที่นอนเสริม
   * ==========================================
   *
   * ถ้ามีเด็ก 2 คน
   * ต้องเสริมที่นอนโดยอัตโนมัติ
   *
   * แต่ถ้ามีเด็ก 9-13 ปีอยู่แล้ว
   * ค่าที่นอนของเด็กกลุ่มนี้รวมอยู่ใน
   * ค่าเด็ก 350 บาท/คนแล้ว
   *
   * กรณีเด็ก 0-8 ปี 2 คน
   * ต้องคิดค่าที่นอนเสริม 350 บาท
   */

  const extraBedRequired =
    childAges.length >= 2;

  const extraChildBedTotal =
    extraBedRequired && paidChildren === 0
      ? room.extraChildBedPrice
      : 0;

  /*
   * ==========================================
   * รวมทั้งหมด
   * ==========================================
   */

  const grandTotal =
    roomTotal +
    extraAdultTotal +
    extraChildTotal +
    extraChildBedTotal;

  return {
    nights: stayDates.length,

    weekdayNights,

    holidayNights,

    roomTotal,

    extraAdultTotal,

    extraChildBedTotal,

    extraChildTotal,

    grandTotal,

    effectiveAdults,

    freeChildren,

    paidChildren,

    adultChildren,

    extraBedRequired,

    breakdown,
  };
}