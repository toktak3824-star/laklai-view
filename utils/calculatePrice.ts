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

  /*
   * ==========================================
   * จำนวนผู้เข้าพัก
   * ==========================================
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

  const effectiveAdults =
    booking.adults + adultChildren;

  const totalGuests =
    booking.adults + childAges.length;

  /*
   * ==========================================
   * ราคาพิเศษ
   * ==========================================
   *
   * 1 คน = 1,009 บาท / คืน
   *
   * บ้าน 4:
   * ผู้ใหญ่ 4 คน = 2,590 บาท / คืน
   *
   * เด็กอายุไม่เกิน 8 ปี
   * คนที่ 5 = ฟรี
   *
   * ราคาพิเศษนี้ใช้แทนราคาปกติของบ้าน
   */

  const isSingleGuest =
    totalGuests === 1 &&
    booking.adults === 1 &&
    childAges.length === 0;

  const isHouse4 =
    room.id === "house4";

  const isHouse4FourAdults =
    isHouse4 &&
    effectiveAdults === 4 &&
    childAges.length === 0;

  /*
   * ==========================================
   * คำนวณราคาห้องพักแต่ละคืน
   * ==========================================
   */

  const breakdown: PriceBreakdownItem[] =
    stayDates.map((date) => {
      const holiday = isHoliday(date);

      let price: number;

      /*
       * คนเดียวทุกบ้าน
       * = 1,009 บาท
       */

      if (isSingleGuest) {
        price = 1009;
      }

      /*
       * บ้าน 4 ผู้ใหญ่ 4 คน
       * = 2,590 บาท
       */

      else if (isHouse4FourAdults) {
        price = 2590;
      }

      /*
       * ราคาปกติ
       */

      else {
        price = holiday
          ? room.pricing.holiday
          : room.pricing.weekday;
      }

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
   * ผู้ใหญ่ที่เกิน 2 คน
   * ==========================================
   */

  const extraAdults = Math.max(
    0,
    effectiveAdults - room.defaultGuests
  );

  /*
   * บ้าน 4 กรณีผู้ใหญ่ 4 คน
   * ราคาห้องถูกกำหนดเป็น 2,590 แล้ว
   * ดังนั้นไม่ต้องบวกค่า extra adult ซ้ำ
   */

  const extraAdultTotal =
    isHouse4FourAdults
      ? 0
      : extraAdults * room.extraAdultPrice;

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
   * เด็ก 2 คนขึ้นไป
   * ต้องพิจารณาที่นอนเสริม
   *
   * แต่เด็ก 9-13 ปี
   * มีค่า 350 บาท/คนอยู่แล้ว
   *
   * เด็ก 0-8 ปี 2 คน
   * คิดค่าที่นอนเสริม 350 บาท
   */

  const extraBedRequired =
    childAges.length >= 2;

  /*
   * บ้าน 4:
   * เด็กคนที่ 5 อายุไม่เกิน 8 ปี
   * นอนร่วมกับพ่อแม่ = ฟรี
   *
   * จึงไม่คิดค่าที่นอนเสริม
   */

  const isHouse4FreeFifthChild =
    isHouse4 &&
    totalGuests === 5 &&
    freeChildren === 1;

  const extraChildBedTotal =
    isHouse4FreeFifthChild
      ? 0
      : extraBedRequired && paidChildren === 0
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