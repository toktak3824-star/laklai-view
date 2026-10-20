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
    (age) => age >= 9 && age <= 14
  ).length;

  const adultChildren = childAges.filter(
    (age) => age >= 15
  ).length;

  const effectiveAdults =
    booking.adults + adultChildren;

  const totalGuests =
    booking.adults + childAges.length;

  const isSingleGuest =
    totalGuests === 1 &&
    booking.adults === 1 &&
    childAges.length === 0;

  const isHouse4 =
    room.id === "house4";

  /*
   * บ้านสุขใจในวันหยุด:
   * ใช้จำนวนผู้เข้าพักทุกวัยรวมกัน
   * และใช้ราคาเหมาจ่ายตามจำนวนคน
   */
  const getHouse4HolidayPrice = (
    guests: number
  ): number | null => {
    switch (guests) {
      case 2:
        return 1900;
      case 3:
        return 2400;
      case 4:
        return 2900;
      case 5:
        return 3250;
      default:
        return null;
    }
  };

  /*
   * ==========================================
   * ราคาพิเศษตามช่วงวันที่
   * ==========================================
   *
   * อ่านข้อมูลจาก room.pricing.datePricing
   */

  const getDatePricing = (date: Date) => {
    const datePricing = room.pricing.datePricing ?? [];

    return datePricing.find((specialPrice) => {
      const startDate = new Date(
        `${specialPrice.startDate}T00:00:00`
      );

      const endDate = new Date(
        `${specialPrice.endDate}T23:59:59`
      );

      return date >= startDate && date <= endDate;
    });
  };

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
       * ลูกค้า 1 คน:
       * วันหยุด 1,200 บาท
       * วันธรรมดา 1,009 บาท
       */
      if (isSingleGuest && holiday) {
        price = 1200;
      } else if (isSingleGuest) {
        price = 1009;
      }

      /*
       * บ้านสุขใจในวันหยุด:
       * ราคาตามจำนวนผู้เข้าพักทุกวัย
       *
       * เมื่อใช้ราคาแบบนี้แล้ว จะไม่บวก
       * ค่าผู้เข้าพักเสริมซ้ำอีก
       */
      else if (isHouse4 && holiday) {
        const holidayPrice =
          getHouse4HolidayPrice(totalGuests);

        if (holidayPrice !== null) {
          price = holidayPrice;
        } else {
          const specialPrice = getDatePricing(date);

          price = specialPrice
            ? specialPrice.price
            : room.pricing.holiday;
        }
      }

      /*
       * ราคาพิเศษตามช่วงวันที่
       */
      else {
        const specialPrice = getDatePricing(date);

        if (specialPrice) {
          price = specialPrice.price;
        } else {
          price = holiday
            ? room.pricing.holiday
            : room.pricing.weekday;
        }
      }

      /*
       * นับจำนวนคืน
       */
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
   * ค่าผู้เข้าพักเสริม
   * ==========================================
   *
   * บ้านสุขใจ:
   * หากเป็นวันหยุดและจำนวนผู้เข้าพัก 2–5 คน
   * ราคาห้องรวมค่าผู้เข้าพักตามจำนวนคนแล้ว
   * จึงไม่บวกค่าเสริมซ้ำ
   *
   * บ้านอื่นและวันธรรมดา:
   * ใช้กฎเดิม
   */

  const extraAdults = Math.max(
    0,
    effectiveAdults - room.defaultGuests
  );

  const house4HolidayTierPricing =
    isHouse4 &&
    stayDates.some((date) => isHoliday(date)) &&
    totalGuests >= 2 &&
    totalGuests <= 5;

  const extraAdultTotal =
    house4HolidayTierPricing
      ? 0
      : extraAdults * room.extraAdultPrice;

  /*
   * ==========================================
   * ค่าเด็กอายุ 9–14 ปี
   * ==========================================
   *
   * บ้านสุขใจที่ใช้ราคาตามจำนวนคนในวันหยุด
   * ไม่คิดค่าเด็กเพิ่มซ้ำ
   *
   * กรณีอื่นคงกฎเดิม
   */

  const extraChildTotal =
    house4HolidayTierPricing
      ? 0
      : paidChildren * room.extraChildBedPrice;

  /*
   * ==========================================
   * ที่นอนเสริม
   * ==========================================
   */

  const extraBedRequired =
    childAges.length >= 2;

  /*
   * บ้านสุขใจ:
   * เด็กคนที่ 5 อายุไม่เกิน 8 ปี
   * ไม่คิดค่าเตียงเพิ่ม
   */

  const isHouse4FreeFifthChild =
    isHouse4 &&
    totalGuests === 5 &&
    freeChildren === 1;

  const extraChildBedTotal =
    house4HolidayTierPricing ||
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

  /*
   * ==========================================
   * ส่งผลลัพธ์กลับ
   * ==========================================
   */

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