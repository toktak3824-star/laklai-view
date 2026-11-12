"use client";

import { calculatePrice } from "@/utils/calculatePrice";
import { useMemo, useState } from "react";
import type { Room } from "@/types/room";
import BookingPolicy from "@/components/BookingPolicy";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

import {
  NATURE_EXPERIENCE,
  calculateNatureExperienceTotal,
  isNatureExperienceAvailable,
} from "@/utils/natureExperience";

// =====================================================
// วันที่งดรับกิจกรรม
// หมายเหตุ:
// วันเหล่านี้ "งดเฉพาะกิจกรรม"
// ไม่ใช่วันปิดรับจองที่พัก
// =====================================================

type Props = {
  room: Room;
};

function generateBookingCode() {
  const now = new Date();

  return (
    "LKV-" +
    now.getFullYear().toString().slice(-2) +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0") +
    "-" +
    Date.now().toString().slice(-4)
  );
}

export default function BookingForm({ room }: Props) {
  const isHouse4 = room.id === "house4";

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [adults, setAdults] = useState(room.defaultGuests);
  const [children, setChildren] = useState(0);
  const [childAges, setChildAges] = useState<number[]>([]);

  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [acceptedPolicy, setAcceptedPolicy] = useState(false);

const [isSubmitting, setIsSubmitting] = useState(false);

// =========================================
// วิถีบ้านป่า
// =========================================

const [natureExperienceSelected, setNatureExperienceSelected] =
  useState(false);

const [natureExperienceDate, setNatureExperienceDate] =
  useState("");

const [natureExperienceParticipants, setNatureExperienceParticipants] =
  useState(0);

  const bookingResult = useMemo(() => {
    if (!checkIn || !checkOut) {
      return null;
    }

    return calculatePrice(room, {
      roomId: room.id,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      adults,
      children,
      childAges,
    });
  }, [
    room,
    checkIn,
    checkOut,
    adults,
    children,
    childAges,
  ]);

  /*
 * =========================================
 * Nature Experience Package
 * =========================================
 *
 * กิจกรรมเลือกวันแยกจากวัน Check-in
 * ผู้เข้าร่วมกิจกรรมเลือกจำนวนเอง
 * ไม่จำเป็นต้องเท่ากับจำนวนผู้เข้าพัก
 */

const natureExperienceAvailable =
  isNatureExperienceAvailable(
    natureExperienceDate
  );

const natureExperienceTotal =
  calculateNatureExperienceTotal(
    natureExperienceDate,
    natureExperienceParticipants,
    natureExperienceSelected
  );

const roomTotal =
  bookingResult?.grandTotal ?? 0;

const totalPrice =
  roomTotal +
  natureExperienceTotal;

const depositAmount = totalPrice >= 4000
  ? Math.ceil(totalPrice / 2)
  : totalPrice;
const balanceAmount = Math.max(0, totalPrice - depositAmount);

    const olderChildren = childAges.filter(
    (age) => age >= 9 && age <= 14
  ).length;

  const adultChildren = childAges.filter(
    (age) => age >= 15
  ).length;

  const effectiveAdults =
    adults + adultChildren;

  const mainGuests =
    effectiveAdults + olderChildren;

  /*
   * =========================================
   * ราคาปกติสำหรับแสดงเป็นราคาขีดฆ่า
   * =========================================
   *
   * ใช้ "ราคาเต็มก่อนโปรโมชั่น" สำหรับแสดง
   * ในบรรทัด ราคาปกติ เท่านั้น
   *
   * ไม่เปลี่ยนยอดที่ลูกค้าต้องจ่ายจริง
   *
   * 1 คน:
   * ใช้ราคาเต็มของบ้าน
   *
   * ผู้ใหญ่เกิน 2 คน:
   * +500 บาท / คน
   *
   * เด็ก 9-14 ปี:
   * +350 บาท / คน
   *
   * เด็ก 0-8 ปี:
   * ฟรี
   */

  const normalExtraAdults = Math.max(
    0,
    effectiveAdults - room.defaultGuests
  );

  const normalExtraAdultPerNight =
    normalExtraAdults * room.extraAdultPrice;

  const normalExtraChildPerNight =
    olderChildren * room.extraChildBedPrice;

  const normalPriceTotal = bookingResult
    ? bookingResult.breakdown.reduce(
        (total, night) => {
          const baseNormalPrice =
            night.type === "holiday"
              ? (
                  room.pricing.originalHoliday ??
                  room.pricing.holiday + 400
                )
              : (
                  room.pricing.originalWeekday ??
                  room.pricing.weekday + 400
                );

          return (
            total +
            baseNormalPrice +
            normalExtraAdultPerNight +
            normalExtraChildPerNight
          );
        },
        0
      )
    : 0;

  /*
   * บ้าน 4:
   * ผู้ใหญ่และเด็กอายุ 9-14 ปีรวมไม่เกิน 5 คน
   * และอนุญาตเด็กอายุ 0-8 ปีที่นอนร่วมกับผู้ปกครองฟรีได้ 1 คน
   */

  const house4MainGuestsFull =
    isHouse4 && mainGuests >= 5;

  /*
   * =========================================
   * จำนวนผู้ใหญ่ที่เลือกได้
   *
   * บ้าน 1-3 = สูงสุด 3 คน
   * บ้าน 4 = สูงสุด 5 คน
   * =========================================
   */

  const maxAdultOption = isHouse4 ? 5 : 3;

  /*
   * =========================================
   * จำนวนเด็กที่เลือกได้
   *
   * บ้าน 4: ผู้ใหญ่และเด็กอายุ 9-14 ปีรวมสูงสุด 5 คน
   * เพิ่มเด็กอายุ 0-8 ปีได้ฟรีอีก 1 คน
   * =========================================
   */

  const maxChildren =
    isHouse4
      ? Math.min(2, Math.max(0, 5 - effectiveAdults) + 1)
      : adults === 3
        ? 1
        : 2;

  /*
   * ถ้ากติกาใหม่ทำให้จำนวนเด็กที่เลือกอยู่เกิน
   * ให้ไม่ปล่อยให้ state ค้างเกินจำนวนที่อนุญาต
   */

  const handleAdultChange = (
    newAdults: number
  ) => {
    setAdults(newAdults);

    /*
     * บ้าน 4:
     * ถ้าเลือกผู้ใหญ่ 4 คน
     * เด็กที่มีอยู่ต้องเป็นเด็กเล็กเท่านั้น
     * และมีได้สูงสุด 1 คน
     */

    if (isHouse4 && newAdults >= 5) {
      setChildren((current) =>
        Math.min(current, 1)
      );

      setChildAges((current) =>
        current
          .slice(0, 1)
          .map((age) =>
            age > 8 ? 8 : age
          )
      );

      return;
    }

    /*
     * บ้าน 1-3:
     * กฎเดิมเมื่อผู้ใหญ่ 3 คน
     * เด็กต้องไม่เกิน 8 ปี
     */

    if (!isHouse4 && newAdults === 3) {
      setChildAges((current) =>
        current.map((age) =>
          age > 8 ? 8 : age
        )
      );

      setChildren((current) =>
        Math.min(current, 1)
      );
    }
  };

  const handleChildrenChange = (
    count: number
  ) => {
    const safeCount = Math.min(
      count,
      maxChildren
    );

    setChildren(safeCount);

    setChildAges((current) => {
      const next = [...current];

      while (next.length < safeCount) {
        next.push(8);
      }

      return next.slice(0, safeCount);
    });
  };

  const handleChildAgeChange = (
    index: number,
    age: number
  ) => {
    /*
     * บ้าน 4 เมื่อคนหลักครบ 4:
     * เด็กที่เพิ่มได้ต้อง <= 8 ปีเท่านั้น
     */

    if (
      isHouse4 &&
      house4MainGuestsFull &&
      age > 8
    ) {
      return;
    }

    /*
     * บ้าน 1-3:
     * ผู้ใหญ่ 3 คน + เด็ก
     * เด็กต้องไม่เกิน 8 ปี
     */

    if (
      !isHouse4 &&
      adults === 3 &&
      age > 8
    ) {
      return;
    }

    setChildAges((current) => {
      const next = [...current];
      next[index] = age;
      return next;
    });
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // =========================================
      // 1. ตรวจข้อมูลเบื้องต้น
      // =========================================

      if (!checkIn || !checkOut) {
        alert("กรุณาเลือกวันเข้าพักและวันออก");
        setIsSubmitting(false);
        return;
      }

      if (checkIn >= checkOut) {
        alert("วันออกต้องมากกว่าวันเข้าพัก");
        setIsSubmitting(false);
        return;
      }

      if (!guestName.trim()) {
        alert("กรุณากรอกชื่อผู้จอง");
        setIsSubmitting(false);
        return;
      }

      if (!email.trim()) {
        alert("กรุณากรอกอีเมล");
        setIsSubmitting(false);
        return;
      }

      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email.trim()
        )
      ) {
        alert("กรุณากรอกอีเมลให้ถูกต้อง");
        setIsSubmitting(false);
        return;
      }

      if (!phone.trim()) {
        alert("กรุณากรอกเบอร์โทรศัพท์");
        setIsSubmitting(false);
        return;
      }

// =========================================
// ตรวจสอบกิจกรรมวิถีบ้านป่า
// =========================================

if (natureExperienceSelected) {

  if (!natureExperienceDate) {
    alert(
      "กรุณาเลือกวันที่ต้องการเข้าร่วมกิจกรรมวิถีบ้านป่า"
    );

    setIsSubmitting(false);
    return;
  }

  if (
    natureExperienceDate < checkIn ||
    natureExperienceDate >= checkOut
  ) {
    alert(
      "วันที่กิจกรรมต้องอยู่ภายในช่วงวันที่เข้าพัก"
    );

    setIsSubmitting(false);
    return;
  }

  if (
    !isNatureExperienceAvailable(
      natureExperienceDate
    )
  ) {
    alert(
      "วันที่เลือกไม่สามารถจัดกิจกรรมวิถีบ้านป่าได้ กรุณาเลือกวันอื่น"
    );

    setIsSubmitting(false);
    return;
  }

  if (
    natureExperienceParticipants <= 0
  ) {
    alert(
      "กรุณาเลือกจำนวนผู้เข้าร่วมกิจกรรม"
    );

    setIsSubmitting(false);
    return;
  }
}

      // =========================================
      // 2. ตรวจจำนวนและอายุผู้เข้าพัก
      // =========================================

      const adultChildren = childAges.filter(
        (age) => age >= 15
      ).length;

      const olderChildren = childAges.filter(
        (age) => age >= 9 && age <= 14
      ).length;

      const youngChildren = childAges.filter(
        (age) => age >= 0 && age <= 8
      ).length;

      const effectiveAdults =
        adults + adultChildren;

      /*
       * =========================================
       * บ้าน 4 — กฎพิเศษ
       * =========================================
       */

      if (isHouse4) {
        /*
         * ผู้ใหญ่ + เด็ก 15+ สูงสุด 5 คน
         */

        if (effectiveAdults > 5) {
          alert(
            "บ้านสุขใจรองรับผู้ใหญ่รวมสูงสุด 5 คน"
          );
          setIsSubmitting(false);
          return;
        }

        /*
         * คนหลัก = ผู้ใหญ่ + เด็ก 9-14
         */

        const mainGuests =
          effectiveAdults + olderChildren;

        /*
         * คนหลักต้องไม่เกิน 5
         */

        if (mainGuests > 5) {
          alert(
            "บ้านสุขใจรองรับผู้ใหญ่และเด็กอายุ 9–14 ปี รวมสูงสุด 5 คน"
          );
          setIsSubmitting(false);
          return;
        }

        /*
         * เด็ก 0-8 ปีเพิ่มได้ฟรีสูงสุด 1 คน
         */

        if (youngChildren > 1) {
          alert(
            "บ้านสุขใจรับเด็กอายุไม่เกิน 8 ปีที่พักร่วมกับผู้ปกครองได้ฟรีสูงสุด 1 คน"
          );
          setIsSubmitting(false);
          return;
        }

        /*
         * รวมจำนวนจริงต้องไม่เกิน 6
         */

        const totalHouse4Guests =
          adults + childAges.length;

        if (totalHouse4Guests > 6) {
          alert(
            "บ้านสุขใจรองรับผู้เข้าพักรวมสูงสุด 6 คน โดยอนุญาตเด็กอายุไม่เกิน 8 ปีที่นอนร่วมกับผู้ปกครองได้ฟรี 1 คน"
          );
          setIsSubmitting(false);
          return;
        }
      }

      /*
       * =========================================
       * บ้าน 1-3 — กฎเดิม
       * =========================================
       */

      if (!isHouse4) {
        if (
          adults === 3 &&
          olderChildren > 0
        ) {
          alert(
            "ไม่สามารถจองได้\n\n" +
              "ผู้ใหญ่ 3 คนสามารถเข้าพักพร้อมเด็กอายุไม่เกิน 8 ปีได้เท่านั้น\n\n" +
              "เนื่องจากที่พักมีที่นอนเสริม 3 ฟุตเพียง 1 ที่ ซึ่งใช้สำหรับผู้ใหญ่คนที่ 3 แล้ว\n\n" +
              "กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง"
          );

          setIsSubmitting(false);
          return;
        }

        if (
          adults === 2 &&
          olderChildren >= 2
        ) {
          alert(
            "ไม่สามารถจองได้\n\n" +
              "เด็กอายุ 9-14 ปี จำนวน 2 คน ไม่สามารถเข้าพักร่วมกับผู้ใหญ่ 2 คนในบ้านหลังเดียวได้\n\n" +
              "กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง"
          );

          setIsSubmitting(false);
          return;
        }

        if (adults >= 4) {
          alert(
            "บ้านพักนี้รองรับผู้ใหญ่สูงสุด 3 คนเท่านั้น\n\n" +
              "กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง"
          );

          setIsSubmitting(false);
          return;
        }

        if (effectiveAdults > 3) {
          alert(
            "ไม่สามารถจองบ้านพักหลังเดียวได้\n\n" +
              "เด็กอายุ 15 ปีขึ้นไปจะคิดเป็นผู้ใหญ่\n\n" +
              "จำนวนผู้ใหญ่ที่ต้องรองรับเกินความจุของบ้านพัก"
          );

          setIsSubmitting(false);
          return;
        }

        if (
          adults === 3 &&
          youngChildren > 1
        ) {
          alert(
            "เมื่อมีผู้ใหญ่ 3 คน สามารถเข้าพักพร้อมเด็กอายุไม่เกิน 8 ปีได้เพียง 1 คนเท่านั้น"
          );

          setIsSubmitting(false);
          return;
        }

        const totalGuests =
          adults + childAges.length;

        if (totalGuests > 4) {
          alert(
            "จำนวนผู้เข้าพักเกินความจุของบ้านพัก"
          );

          setIsSubmitting(false);
          return;
        }
      }

      // =========================================
      // 3. ตรวจสอบวันว่างกับฐานข้อมูล
      // =========================================

      console.log(
        "กำลังตรวจสอบวันว่าง..."
      );

      const availabilityResponse =
        await fetch(
          "/api/bookings/check-availability",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              roomId: room.id,
              checkIn,
              checkOut,
              adults,
              childAges,
            }),
          }
        );

      const availabilityResult =
        await availabilityResponse.json();

      console.log(
        "AVAILABILITY RESPONSE =",
        availabilityResult
      );

      if (
        !availabilityResponse.ok ||
        !availabilityResult.available
      ) {
        if (
          availabilityResult.reason ===
          "guest_limit"
        ) {
          alert(
            "❌ ไม่สามารถจองบ้านพักหลังนี้ได้\n\n" +
              availabilityResult.message
          );
        } else if (
          availabilityResult.reason ===
          "booked"
        ) {
          alert(
            "🔴 วันที่ที่คุณเลือกมีการจองแล้ว\n\nกรุณาเลือกวันอื่น"
          );
        } else if (
          availabilityResult.reason ===
          "blocked"
        ) {
          alert(
            "🔒 ช่วงวันที่ที่คุณเลือกมีวันที่ปิดรับจอง\n\nกรุณาเลือกวันอื่น"
          );
        } else {
          alert(
            availabilityResult.error ||
              availabilityResult.message ||
              "ไม่สามารถจองช่วงวันที่นี้ได้"
          );
        }

        setIsSubmitting(false);
        return;
      }

      // =========================================
      // 4. สร้าง Booking Code
      // =========================================

      const bookingCode = generateBookingCode();

      // =========================================
      // 5. สร้าง Booking
      // =========================================

      const response = await fetch("/api/bookings/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
  room_id: room.id,
  guest_name: guestName.trim(),
  email: email.trim(),
  phone: phone.trim(),

  check_in: checkIn,
  check_out: checkOut,

  adults,
  children,
  child_ages: childAges,

  total_price: totalPrice,

  nature_experience_selected:
    natureExperienceSelected,

  nature_experience_date:
    natureExperienceSelected
      ? natureExperienceDate
      : null,

  nature_experience_participants:
    natureExperienceSelected
      ? natureExperienceParticipants
      : 0,

  nature_experience_total:
    natureExperienceSelected
      ? natureExperienceTotal
      : 0,

  booking_status: "pending",
  payment_status: "waiting",
  slip_url: "",
  booking_code: bookingCode,

  // อาหารเย็นจะเลือกในหน้าชำระเงิน โดยใช้ Booking Code เดิม
  dinner_items: [],
  dinner_total: 0,
}),
});

const result = await response.json();

if (!response.ok || !result.success) {
  throw new Error(
    result.error || "ไม่สามารถสร้างการจองได้"
  );
}

const booking = result.booking;

      console.log(
        "บันทึกการจองสำเร็จ =",
        booking
      );

      // ยังไม่ส่งอีเมลยืนยันในขั้นตอนนี้
      // ลูกค้าต้องชำระเงินและแนบสลิปก่อน
      // แอดมินตรวจสอบและยืนยันแล้วจึงส่งอีเมลยืนยัน

      // =========================================
      // 7. ไปหน้าชำระเงิน
      // =========================================

      window.location.assign(
  `/payment/${bookingCode}`
);
    } catch (error) {
      console.error(
        "BOOKING ERROR =",
        error
      );

      setIsSubmitting(false);

      alert(
        "เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง"
      );
    }
  };

  return (
    <section
      id="booking"
      className="mt-12 scroll-mt-24"
    >
      <div className="mx-auto w-full max-w-3xl overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-xl">

        {/* Header */}
        <div className="bg-gradient-to-br from-green-950 to-green-800 px-5 py-7 text-white sm:px-8">
          <p className="mb-2 text-sm font-medium text-green-200">
            LAKLAI VIEW
          </p>

          <h2 className="text-3xl font-bold sm:text-4xl">
            จองที่พัก
          </h2>

          <p className="mt-2 text-sm leading-6 text-green-100 sm:text-base">
            เลือกวันเข้าพักและกรอกข้อมูลเพื่อดำเนินการจอง
          </p>
        </div>

        <div className="space-y-6 p-4 sm:p-8">

          {/* Calendar */}
          <div>
            <div className="mb-3">
              <h3 className="text-lg font-bold text-stone-800">
                📅 เลือกวันเข้าพัก
              </h3>

              <p className="mt-1 text-sm text-stone-500">
                ตรวจสอบวันว่างก่อนทำรายการจอง
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-950 p-2 sm:p-5">
              <AvailabilityCalendar
                roomId={room.id}
                checkIn={checkIn}
                checkOut={checkOut}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">

            <div>
              <label
                htmlFor="check-in"
                className="mb-2 block text-sm font-semibold text-stone-700"
              >
                วันเข้าพัก
              </label>

              <input
                id="check-in"
                type="date"
                value={checkIn}
                onChange={(e) => {
                  setCheckIn(
                    e.target.value
                  );

                  if (
                    checkOut &&
                    e.target.value >=
                      checkOut
                  ) {
                    setCheckOut("");
                  }
                }}
                className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="check-out"
                className="mb-2 block text-sm font-semibold text-stone-700"
              >
                วันออก
              </label>

              <input
                id="check-out"
                type="date"
                value={checkOut}
                min={
                  checkIn || undefined
                }
                onChange={(e) =>
                  setCheckOut(
                    e.target.value
                  )
                }
                className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

          </div>

          {/* Guests */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-stone-800">
              👨‍👩‍👧 จำนวนผู้เข้าพัก
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">

              {/* Adults */}
              <div>
                <label
                  htmlFor="adults"
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  ผู้ใหญ่
                </label>

                <select
                  id="adults"
                  value={adults}
                  onChange={(e) =>
                    handleAdultChange(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  {Array.from(
                    {
                      length:
                        maxAdultOption,
                    },
                    (_, index) => {
                      const n =
                        index + 1;

                      return (
                        <option
                          key={n}
                          value={n}
                        >
                          {n} คน
                        </option>
                      );
                    }
                  )}
                </select>
              </div>

              {/* Children */}
              <div>
                <label
                  htmlFor="children"
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  เด็ก
                </label>

                <select
                  id="children"
                  value={children}
                  onChange={(e) =>
                    handleChildrenChange(
                      Number(
                        e.target.value
                      )
                    )
                  }
                  className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  {Array.from(
                    {
                      length:
                        maxChildren + 1,
                    },
                    (_, n) => (
                      <option
                        key={n}
                        value={n}
                      >
                        {n} คน
                      </option>
                    )
                  )}
                </select>
              </div>

            </div>

            {/* Child ages */}
            {children > 0 && (
              <div className="mt-4 rounded-2xl bg-stone-50 p-4">

                <p className="mb-3 text-sm font-bold text-stone-700">
                  อายุเด็ก
                </p>

                <div className="grid gap-3 sm:grid-cols-2">

                  {childAges.map(
                    (age, index) => (
                      <div key={index}>

                        <label className="mb-2 block text-sm text-stone-600">
                          เด็กคนที่{" "}
                          {index + 1}
                        </label>

                        <select
                          value={age}
                          onChange={(e) =>
                            handleChildAgeChange(
                              index,
                              Number(
                                e.target.value
                              )
                            )
                          }
                          className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black"
                        >
                          {Array.from(
                            {
                              length: 18,
                            },
                            (_, ageOption) => {

                              /*
                               * บ้าน 4 เมื่อคนหลักครบ 4:
                               * ให้เลือกได้เฉพาะ 0-8 ปี
                               */

                              if (
                                isHouse4 &&
                                house4MainGuestsFull &&
                                ageOption > 8
                              ) {
                                return null;
                              }

                              /*
                               * บ้าน 1-3 เมื่อผู้ใหญ่ 3:
                               * เด็กต้อง <= 8 ปี
                               */

                              if (
                                !isHouse4 &&
                                adults === 3 &&
                                ageOption > 8
                              ) {
                                return null;
                              }

                              return (
                                <option
                                  key={ageOption}
                                  value={
                                    ageOption
                                  }
                                >
                                  {ageOption} ปี
                                </option>
                              );
                            }
                          )}
                        </select>

                      </div>
                    )
                  )}

                </div>
              </div>
            )}

          </div>

          {/* Guest information */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-stone-800">
              👤 ข้อมูลผู้จอง
            </h3>

            <div className="space-y-4">

              <div>
                <label
                  htmlFor="guest-name"
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  ชื่อผู้จอง
                </label>

                <input
                  id="guest-name"
                  type="text"
                  placeholder="กรอกชื่อ-นามสกุล"
                  value={guestName}
                  onChange={(e) =>
                    setGuestName(
                      e.target.value
                    )
                  }
                  autoComplete="name"
                  className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black placeholder:text-stone-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="guest-email"
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  อีเมล
                </label>

                <input
                  id="guest-email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(
                      e.target.value
                    )
                  }
                  autoComplete="email"
                  inputMode="email"
                  className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black placeholder:text-stone-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

              <div>
                <label
                  htmlFor="guest-phone"
                  className="mb-2 block text-sm font-semibold text-stone-700"
                >
                  เบอร์โทรศัพท์
                </label>

                <input
                  id="guest-phone"
                  type="tel"
                  placeholder="08xxxxxxxx"
                  value={phone}
                  onChange={(e) =>
                    setPhone(
                      e.target.value
                    )
                  }
                  autoComplete="tel"
                  inputMode="tel"
                  className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black placeholder:text-stone-400 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                />
              </div>

            </div>
          </div>

{/* Price preview: แสดงหลังข้อมูลผู้จอง ก่อนสั่งอาหาร */}
          {bookingResult && (
            <div className="overflow-hidden rounded-2xl border-2 border-green-200 bg-green-50">
              <div className="border-b border-green-200 px-5 py-4">
                <h3 className="text-lg font-bold text-green-950">
                  💰 สรุปราคาที่พักเบื้องต้น
                </h3>
                <p className="mt-1 text-sm text-green-800">
                  ตรวจสอบราคาที่พักและกิจกรรมก่อนดำเนินการต่อ
                </p>
              </div>
              <div className="space-y-3 px-5 py-5">
                <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
                  <span>บ้านพัก</span>
                  <span className="font-semibold text-stone-800">{room.title}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
                  <span>วันเข้าพัก – วันออก</span>
                  <span className="text-right font-semibold text-stone-800">{checkIn} – {checkOut}</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
                  <span>จำนวนคืน</span>
                  <span className="font-semibold text-stone-800">{bookingResult.nights} คืน</span>
                </div>
                <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
                  <span>จำนวนผู้เข้าพัก</span>
                  <span className="font-semibold text-stone-800">
                    ผู้ใหญ่ {adults} คน{children > 0 ? ` และเด็ก ${children} คน` : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4 border-t border-green-200 pt-3">
                  <span className="font-bold text-green-950">รวมค่าที่พัก</span>
                  <span className="text-2xl font-bold text-green-700">฿{roomTotal.toLocaleString("th-TH")}</span>
                </div>
                <p className="text-xs leading-5 text-stone-600">
                  ราคานี้เป็นค่าที่พักตามวันและจำนวนผู้เข้าพักที่เลือก ยังไม่รวมกิจกรรมวิถีบ้านป่าที่เลือกเพิ่มเติม ส่วนอาหารเย็นสามารถเลือกได้ในหน้าชำระเงินและชำระแยกในวันเช็กอิน
                </p>
              </div>
            </div>
          )}

          {/* Dinner ordering is moved to the payment page */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              LAKLAI VIEW DINNER
            </p>
            <h3 className="mt-1 text-xl font-bold text-amber-950">
              🍽️ สั่งอาหารเย็นล่วงหน้า
            </h3>
            <p className="mt-2 text-sm leading-6 text-stone-700">
              ท่านสามารถเลือกเมนูอาหารเย็นได้ในขั้นตอนถัดไป หลังจากกดยืนยันการจองและเข้าสู่หน้าชำระเงิน
            </p>
            <p className="mt-2 text-sm leading-6 text-amber-800">
              กรุณาสั่งอาหารล่วงหน้าอย่างน้อย 1 วันก่อนวันเข้าพัก ค่าอาหารคิดแยกจากค่าที่พักและกิจกรรม และชำระในวันเช็กอิน
            </p>
            <p className="mt-2 text-sm leading-6 text-green-800">
              หากเลือกกิจกรรมวิถีบ้านป่า ซึ่งรวมอาหาร 3 มื้อแล้ว ไม่จำเป็นต้องสั่งอาหารเย็นเพิ่มเติม
            </p>
          </div>


<div>
  <div className="overflow-hidden rounded-2xl border border-green-200 bg-green-50">

    <div className="bg-green-900 px-5 py-4 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-200">
        LAKLAI VIEW EXPERIENCE
      </p>

      <h3 className="mt-1 text-xl font-bold">
        🌿 {NATURE_EXPERIENCE.shortTitle}  {NATURE_EXPERIENCE.subtitle}
      </h3>

      <p className="mt-1 text-sm text-green-100">
        18 กันยายน 2026 – 20 มีนาคม 2027
      </p>
    </div>

    <div className="space-y-4 px-5 py-5">

      {/* กิจกรรม 4 ขั้นตอน — แสดงภาพเต็ม ไม่ตัดส่วนใดของภาพ */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          {
            step: "01",
            title: "เดินชมเส้นทางธรรมชาติ",
            description: "เดินระยะสั้นประมาณ 700–800 เมตร ชมป่าและลำธารไปกับเจ้าของที่พักและคนท้องถิ่น",
            image: "/images/nature-experience/activity-walk.jpg",
          },
          {
            step: "02",
            title: "ล่องห่วงยางตามลำน้ำ",
            description: "ล่องไปตามลำธารระยะทางประมาณ 1 กิโลเมตร สนุกกับธรรมชาติ ไม่ต้องเดินย้อนกลับ",
            image: "/images/nature-experience/activity-tubing.jpg",
          },
          {
            step: "03",
            title: "หาวัตถุดิบพื้นบ้าน",
            description: "ใช้เวลาประมาณ 30–40 นาที เรียนรู้การหาปลา กุ้ง หอย ปู และเก็บผักกูดตามธรรมชาติ",
            image: "/images/nature-experience/activity-foraging.jpg",
          },
          {
            step: "04",
            title: "ปรุงอาหารและกินร่วมกัน",
            description: "นำวัตถุดิบที่หาได้มาปรุงเป็นอาหารพื้นบ้าน รับประทานร่วมกับเจ้าของที่พักและคนท้องถิ่น",
            image: "/images/nature-experience/activity-cooking.jpg",
          },
        ].map((item) => (
          <article key={item.step} className="overflow-hidden rounded-2xl border border-green-100 bg-white">
            <div className="flex min-h-52 items-center justify-center bg-stone-100 p-2 sm:min-h-60">
              <img
                src={item.image}
                alt={item.title}
                className="max-h-80 w-full object-contain"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <p className="text-xs font-bold tracking-widest text-green-700">STEP {item.step}</p>
              <h4 className="mt-1 font-bold text-green-950">{item.title}</h4>
              <p className="mt-1 text-sm leading-6 text-stone-600">{item.description}</p>
            </div>
          </article>
        ))}
      </div>

      {/* วิดีโอกิจกรรมจริง — แตะเพื่อเล่น และไม่ตัดภาพ */}
      <div>
        <h4 className="mb-3 font-bold text-green-950">🎥 บรรยากาศกิจกรรมจริง</h4>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {["nature5.mp4", "nature6.mp4", "nature7.mp4", "nature8.mp4", "nature9.mp4", "nature10.mp4"].map((video) => (
            <video
              key={video}
              src={`/images/nature-experience/${video}`}
              controls
              playsInline
              preload="metadata"
              className="max-h-72 w-full rounded-xl bg-stone-950 object-contain"
            />
          ))}
        </div>
      </div>

      <p className="text-sm leading-7 text-stone-700">
        ใช้เวลาประมาณ 4 ชั่วโมง สัมผัสธรรมชาติแบบไม่เร่งรีบ
        ตั้งแต่เดินชมป่า ล่องห่วงยางไปตามลำธาร หาวัตถุดิบพื้นบ้าน
        ไปจนถึงช่วยกันปรุงอาหารและรับประทานร่วมกัน
        โดยมีเจ้าของที่พักและคนท้องถิ่นดูแลตลอดกิจกรรม
      </p>

      <div className="rounded-xl border border-green-200 bg-white p-4 text-sm leading-7 text-stone-700">
        <p>🕥 <b>เวลาเริ่มกิจกรรม:</b> 10:30–11:00 น.</p>
        <p>⏱️ <b>ระยะเวลา:</b> ประมาณ 4 ชั่วโมง เสร็จประมาณ 14:30–15:00 น.</p>
        <p>🥾 <b>เดินชมธรรมชาติ:</b> เส้นทางระยะสั้นประมาณ 700–800 เมตร</p>
        <p>🛟 <b>ล่องห่วงยาง:</b> ตามลำน้ำประมาณ 1 กิโลเมตร มีรถรับกลับ ไม่ต้องเดินย้อนทาง</p>
        <p>🦐 <b>หาวัตถุดิบ:</b> ประมาณ 30–40 นาที เรียนรู้การหาปลา กุ้ง หอย ปู และเก็บผักพื้นบ้านตามฤดูกาล</p>
        <p>🍲 <b>อาหาร 3 มื้อสำหรับผู้เข้าร่วม:</b> มื้อกลางวันระหว่างกิจกรรม มื้อเย็น และมื้อเช้า</p>
        <p className="mt-2 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-900">
          กิจกรรมเป็นประสบการณ์กลุ่ม แนะนำให้ผู้เข้าพักร่วมกิจกรรมไปด้วยกัน เพื่อให้ทุกคนได้ใช้เวลาร่วมกัน
        </p>
      </div>
{natureExperienceSelected && (
  <div className="rounded-xl border border-green-200 bg-white p-4">

    <label
      htmlFor="nature-experience-date"
      className="mb-2 block text-sm font-semibold text-stone-700"
    >
      📅 วันที่ต้องการเข้าร่วมกิจกรรม
    </label>

    <input
      id="nature-experience-date"
      type="date"
      value={natureExperienceDate}
      min={checkIn || undefined}
      max={
        checkOut
          ? new Date(
              new Date(checkOut).getTime() -
                24 * 60 * 60 * 1000
            )
              .toISOString()
              .split("T")[0]
          : undefined
      }
      onChange={(e) => {
        setNatureExperienceDate(e.target.value);
      }}
      className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black"
    />

    <p className="mt-2 text-xs leading-5 text-stone-500">
      เลือกวันที่กิจกรรมได้ภายในช่วงวันที่เข้าพัก
      ทั้งวันธรรมดาและวันเสาร์–อาทิตย์
      โดยงดจัดกิจกรรมในวันหยุดนักขัตฤกษ์
    </p>

    {natureExperienceDate &&
      !isNatureExperienceAvailable(
        natureExperienceDate
      ) && (
        <p className="mt-2 text-sm font-semibold text-red-600">
          ❌ วันที่เลือกไม่สามารถจัดกิจกรรมได้
          กรุณาเลือกวันอื่น
        </p>
      )}

  </div>
)}

{natureExperienceSelected && (
  <div className="rounded-xl border border-green-200 bg-white p-4">

    <label
      htmlFor="nature-experience-participants"
      className="mb-2 block text-sm font-semibold text-stone-700"
    >
      👥 จำนวนผู้เข้าร่วมกิจกรรม
    </label>

    <select
      id="nature-experience-participants"
      value={natureExperienceParticipants}
      onChange={(e) => {
        setNatureExperienceParticipants(
          Number(e.target.value)
        );
      }}
      className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black"
    >

      <option value={0}>
        กรุณาเลือกจำนวนผู้เข้าร่วม
      </option>

      {Array.from(
        { length: 20 },
        (_, index) => index + 1
      ).map((count) => (
        <option
          key={count}
          value={count}
        >
          {count} คน
        </option>
      ))}

    </select>

    <div className="mt-2 space-y-1">
  <p className="text-xs leading-5 text-stone-500">
    กิจกรรมเป็นประสบการณ์กลุ่ม แนะนำให้ผู้เข้าพักร่วมกิจกรรมพร้อมกัน
  </p>

  <p className="text-xs font-semibold leading-5 text-red-600">
    ⚠️ ไม่อนุญาตให้เด็กอายุต่ำกว่า 12 ปีเข้าร่วมกิจกรรม
  </p>
</div>

  </div>
)}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-green-300 bg-white p-4">

        <input
  type="checkbox"
  checked={natureExperienceSelected}
  onChange={(e) => {
    const selected = e.target.checked;
    setNatureExperienceSelected(selected);

    if (!selected) {
      setNatureExperienceDate("");
      setNatureExperienceParticipants(0);
    }
  }}
  className="mt-1 h-5 w-5 shrink-0 accent-green-700"
/>

        <div className="flex-1">

          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">

  <span className="font-bold text-green-900">
    เพิ่มกิจกรรมนี้ในการจอง
  </span>

  <span className="text-lg font-bold text-green-700">
    ฿899 / คน รวมอาหาร 3 มื้อ
  </span>

</div>

<p className="mt-2 text-sm leading-6 text-stone-500">
  คิดตามจำนวนผู้เข้าร่วมกิจกรรม
  และคิดเพียงครั้งเดียวต่อการจอง
  ไม่คิดตามจำนวนคืนที่เข้าพัก
</p>

        </div>

      </label>

    </div>
  </div>
</div>

          {/* Price summary */}
<div className="overflow-hidden rounded-2xl border border-green-200 bg-green-50">

  <div className="border-b border-green-200 px-5 py-4">
    <h3 className="text-lg font-bold text-green-950">
      💰 สรุปการจอง
    </h3>
  </div>

  <div className="space-y-3 px-5 py-5">

    <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
      <span>
        จำนวนคืน
      </span>

      <span className="font-semibold text-stone-800">
        {bookingResult?.nights ?? 0} คืน
      </span>
    </div>

    {bookingResult && bookingResult.extraAdultTotal > 0 && (
      <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
        <span>ค่าผู้ใหญ่เสริม</span>
        <span className="font-semibold text-stone-800">฿{bookingResult.extraAdultTotal.toLocaleString("th-TH")}</span>
      </div>
    )}

    {bookingResult && bookingResult.extraChildTotal > 0 && (
      <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
        <span>ค่าเด็กอายุ 9–14 ปี</span>
        <span className="font-semibold text-stone-800">฿{bookingResult.extraChildTotal.toLocaleString("th-TH")}</span>
      </div>
    )}

    {bookingResult && bookingResult.extraChildBedTotal > 0 && (
      <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
        <span>ค่าที่นอนเสริมสำหรับเด็ก</span>
        <span className="font-semibold text-stone-800">฿{bookingResult.extraChildBedTotal.toLocaleString("th-TH")}</span>
      </div>
    )}

    <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
      <span>
  ราคารวมปกติก่อนส่วนลด
</span>

      <span className="line-through text-stone-400">
        ฿{normalPriceTotal.toLocaleString()}
      </span>
    </div>
{natureExperienceSelected &&
  natureExperienceTotal > 0 && (
    <div className="mt-6 rounded-xl border-2 border-green-200 bg-white p-4">

      <div className="flex items-start justify-between gap-4">

        <div className="min-w-0">

          <p className="font-semibold text-green-900">
            🌿 วิถีบ้านป่า
          </p>

          <p className="mt-1 text-xs leading-5 text-stone-500">
            📅 วันที่กิจกรรม:{" "}
            {natureExperienceDate
              ? new Date(
                  `${natureExperienceDate}T00:00:00`
                ).toLocaleDateString("th-TH", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "-"}
          </p>

          <p className="mt-1 text-xs leading-5 text-stone-500">
  👥 ผู้เข้าร่วม:{" "}
  {natureExperienceParticipants} คน
</p>

<p className="mt-1 text-xs leading-5 text-stone-500">
  ฿899 × {natureExperienceParticipants} คน
</p>

<p className="mt-2 text-xs leading-5 text-stone-600">
  🕥 เริ่มกิจกรรม 10:30–11:00 น. ใช้เวลาประมาณ 4 ชั่วโมง
  <br />
  🏡 เสร็จกิจกรรมประมาณ 14:30–15:00 น.
  <br />
  🍲 รวมอาหาร 3 มื้อ: กลางวันระหว่างกิจกรรม มื้อเย็น และมื้อเช้า
</p>
        </div>

        <span className="shrink-0 font-bold text-green-700">
          ฿{natureExperienceTotal.toLocaleString()}
        </span>

      </div>

    </div>
  )}

    <div className="space-y-3 border-t border-green-200 pt-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-600">ยอดรวมค่าที่พักและกิจกรรม</p>
          <p className="text-xs text-stone-500">ยอดนี้รวมค่าที่พักและกิจกรรม (ถ้าเลือก) ไม่รวมค่าอาหารเย็น ซึ่งเลือกได้ในหน้าชำระเงินและชำระแยกในวันเช็กอิน</p>
        </div>
        <p className="text-xl font-bold text-stone-800">฿{totalPrice.toLocaleString("th-TH")}</p>
      </div>

      <div className="flex items-center justify-between gap-4 rounded-xl bg-white p-4">
        <div>
          <p className="font-bold text-green-800">ยอดที่ต้องชำระตอนนี้</p>
          <p className="text-xs text-stone-500">{totalPrice >= 4000 ? "มัดจำ 50% ของยอดค่าที่พักรวมกิจกรรม" : "ยอดรวมต่ำกว่า 4,000 บาท ชำระเต็มจำนวน"}</p>
        </div>
        <p className="text-2xl font-bold text-green-700">฿{depositAmount.toLocaleString("th-TH")}</p>
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
        <span>ยอดคงเหลือค่าที่พัก/กิจกรรม (ถ้ามี) ชำระวันเช็กอิน</span>
        <span className="font-semibold text-stone-800">฿{balanceAmount.toLocaleString("th-TH")}</span>
      </div>
    </div>

  </div>
</div>

          {/* Policy */}
          <BookingPolicy />

          <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 sm:p-5">

            <label className="flex cursor-pointer items-start gap-3">

              <input
                type="checkbox"
                checked={acceptedPolicy}
                onChange={(e) =>
                  setAcceptedPolicy(
                    e.target.checked
                  )
                }
                className="mt-1 h-5 w-5 shrink-0 accent-green-700"
              />

              <span className="text-sm leading-6 text-stone-700">
                ข้าพเจ้าได้อ่านและเข้าใจ
                ข้อตกลงและเงื่อนไขการเข้าพักทั้งหมดแล้ว
                และยอมรับเงื่อนไขของหลักลาย View
              </span>

            </label>

          </div>

          {/* Submit */}
          <button
            type="button"
            disabled={
              !acceptedPolicy ||
              isSubmitting
            }
            onClick={handleSubmit}
            className="min-h-14 w-full rounded-2xl bg-green-700 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-800 active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-stone-300 disabled:text-stone-500"
          >
            {isSubmitting
              ? "กำลังดำเนินการ..."
              : "ยืนยันการจอง"}
          </button>

          <p className="text-center text-xs leading-5 text-stone-400">
            หลังจากยืนยันการจอง
            ระบบจะพาไปยังหน้าชำระเงิน
          </p>

        </div>
      </div>
    </section>
  );
}