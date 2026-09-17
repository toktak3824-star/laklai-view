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

    const olderChildren = childAges.filter(
    (age) => age >= 9 && age <= 13
  ).length;

  const adultChildren = childAges.filter(
    (age) => age >= 14
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
   * เด็ก 9-13 ปี:
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
   * เมื่อคนหลักครบ 4 คน
   * อนุญาตเด็ก 0-8 ปีเพิ่มได้ 1 คน
   */

  const house4MainGuestsFull =
    isHouse4 && mainGuests >= 4;

  /*
   * =========================================
   * จำนวนผู้ใหญ่ที่เลือกได้
   *
   * บ้าน 1-3 = สูงสุด 3 คน
   * บ้าน 4 = สูงสุด 4 คน
   * =========================================
   */

  const maxAdultOption = isHouse4 ? 4 : 3;

  /*
   * =========================================
   * จำนวนเด็กที่เลือกได้
   *
   * บ้าน 4:
   * ถ้าคนหลักครบ 4 แล้ว
   * เพิ่มเด็กเล็กได้สูงสุด 1 คน
   *
   * ถ้ายังไม่ครบ 4 คน
   * ใช้กฎเดิมของบ้าน
   * =========================================
   */

  const maxChildren =
    isHouse4
      ? house4MainGuestsFull
        ? 1
        : Math.min(2, 4 - mainGuests)
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

    if (isHouse4 && newAdults >= 4) {
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
        (age) => age >= 14
      ).length;

      const olderChildren = childAges.filter(
        (age) => age >= 9 && age <= 13
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
         * ผู้ใหญ่ + เด็ก 14+ สูงสุด 4 คน
         */

        if (effectiveAdults > 4) {
          alert(
            "บ้านสุขใจรองรับผู้ใหญ่รวมสูงสุด 4 คน"
          );
          setIsSubmitting(false);
          return;
        }

        /*
         * คนหลัก = ผู้ใหญ่ + เด็ก 9-13
         */

        const mainGuests =
          effectiveAdults + olderChildren;

        /*
         * คนหลักต้องไม่เกิน 4
         */

        if (mainGuests > 4) {
          alert(
            "บ้านสุขใจรองรับผู้ใหญ่และเด็กอายุ 9 ปีขึ้นไป รวมสูงสุด 4 คน"
          );
          setIsSubmitting(false);
          return;
        }

        /*
         * เมื่อครบ 4 คนหลักแล้ว
         * เด็ก 0-8 เพิ่มได้ 1 คนฟรี
         */

        if (
          mainGuests === 4 &&
          youngChildren > 1
        ) {
          alert(
            "เมื่อผู้ใหญ่และเด็กโตครบ 4 คนแล้ว สามารถเพิ่มเด็กอายุไม่เกิน 8 ปีได้อีก 1 คนฟรี"
          );
          setIsSubmitting(false);
          return;
        }

        /*
         * รวมจำนวนจริงต้องไม่เกิน 5
         */

        const totalHouse4Guests =
          adults + childAges.length;

        if (totalHouse4Guests > 5) {
          alert(
            "บ้านสุขใจรองรับผู้เข้าพักสูงสุด 5 คน โดยคนที่ 5 ต้องเป็นเด็กอายุไม่เกิน 8 ปี"
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
              "เด็กอายุ 9-13 ปี จำนวน 2 คน ไม่สามารถเข้าพักร่วมกับผู้ใหญ่ 2 คนในบ้านหลังเดียวได้\n\n" +
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
              "เด็กอายุ 14 ปีขึ้นไปจะคิดเป็นผู้ใหญ่\n\n" +
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

      // =========================================
      // 6. ส่ง Email
      // =========================================

      const customerEmail =
        email.trim();

      const emailResponse =
        await fetch(
          "/api/send-email",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              email:
                customerEmail,
              customerEmail,
              guestName,
              roomName:
                room.title,
              checkIn,
              checkOut,
              totalPrice,
              bookingCode,
              adults,
              childAges,
              natureExperienceSelected,

natureExperienceDate:
  natureExperienceSelected
    ? natureExperienceDate
    : null,

natureExperienceParticipants:
  natureExperienceSelected
    ? natureExperienceParticipants
    : 0,

natureExperienceTotal:
  natureExperienceSelected
    ? natureExperienceTotal
    : 0,
            }),
          }
        );

      const emailResult =
        await emailResponse.json();

      console.log(
        "EMAIL RESPONSE =",
        emailResult
      );

      if (!emailResponse.ok) {
        console.error(
          "EMAIL ERROR =",
          emailResult
        );
      }

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

{/* =========================================
    NATURE EXPERIENCE PACKAGE
========================================= */}

<div>
  <div className="overflow-hidden rounded-2xl border border-green-200 bg-green-50">

    <div className="bg-green-900 px-5 py-4 text-white">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-green-200">
        LAKLAI VIEW EXPERIENCE
      </p>

      <h3 className="mt-1 text-xl font-bold">
        🌿 {NATURE_EXPERIENCE.shortTitle}
      </h3>

      <p className="mt-1 text-sm text-green-100">
        ตุลาคม 2026 – มกราคม 2027
      </p>
    </div>

    <div className="space-y-4 px-5 py-5">

      <p className="text-sm leading-7 text-stone-700">
        เดินเส้นทางธรรมชาติ ลัดเลาะตามป่าเขาและเนินธรรมชาติ
        โดยเจ้าของที่พักและมัคคุเทศก์ท้องถิ่นพาเดิน
        สัมผัสน้ำตกและธรรมชาติ พร้อมเก็บผักพื้นบ้าน
        ตามฤดูกาล เพื่อนำกลับมาประกอบเป็นอาหารเย็น
        แบบเรียบง่าย
      </p>

      <div className="rounded-xl border border-green-200 bg-white p-4 text-sm leading-7 text-stone-700">

        <p>
          🌳 <b>ช่วงกิจกรรม</b> เดินเส้นทางธรรมชาติ
        </p>

        <p>
          🌿 <b>สิ่งที่ได้สัมผัส</b> ธรรมชาติ น้ำตก
          ลำธาร ประสบการณ์ใหม่ วิถีชีวิตคนพื้นเมืองน่าน และวัตถุดิบพื้นบ้านตามฤดูกาล
        </p>

         <p>
          🥾 <b>ออกเดินทาง</b> {NATURE_EXPERIENCE.departureTime}
          ศึกษาธรรมชาติ เดินป่า และเก็บผักพื้นบ้านตามฤดูกาล
        </p>  
        
        <p>
        
          🏡 <b>กลับถึงที่พัก</b> {NATURE_EXPERIENCE.returnTime}
          เพื่อพักผ่อนตามอัธยาศัย
        </p>

        <p>
          🍚 <b>อาหารเย็น</b> {NATURE_EXPERIENCE.dinnerTime}
          ที่{NATURE_EXPERIENCE.dinnerLocation}
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

    <p className="mt-2 text-xs leading-5 text-stone-500">
      จำนวนผู้เข้าร่วมกิจกรรมสามารถเลือกแยกจากจำนวนผู้เข้าพักได้
    </p>

  </div>
)}
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-green-300 bg-white p-4">

        <input
  type="checkbox"
  checked={natureExperienceSelected}
  onChange={(e) => {
    setNatureExperienceSelected(
      e.target.checked
    );

    if (!e.target.checked) {
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
    ฿899 / คน พร้อมอาหารระหว่างกิจกรรม-เย็น
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

    {/* โปรโมชั่นเดือนกันยายน */}
    {bookingResult &&
      bookingResult.breakdown.some(
        (night) =>
          night.price ===
          (isHouse4 ? 1499 : 1699)
      ) && (
        <div className="rounded-xl border border-green-300 bg-white px-4 py-3">

          <p className="font-bold text-green-800">
            🎉 โปรโมชั่นพิเศษเดือนกันยายน 2026
          </p>

          <p className="mt-1 text-sm text-stone-600">
            {isHouse4
              ? "บ้านสุขใจ เหลือเพียง 1,499 บาท / คืน"
              : "ราคาพิเศษ เหลือเพียง 1,699 บาท / คืน"}
          </p>

          <p className="mt-1 text-sm font-semibold text-green-700">
            🍈 เก็บเงาะทานฟรีได้เลย
          </p>

        </div>
      )}

    <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
      <span>
        ราคาปกติ
      </span>

      <span className="line-through text-stone-400">
        ฿{normalPriceTotal.toLocaleString()}
      </span>
    </div>
{natureExperienceSelected &&
  natureExperienceTotal > 0 && (
    <div className="rounded-xl border border-green-200 bg-white p-4">

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

<p className="mt-2 text-xs leading-5 text-stone-500">
  🥾 ออกเดินทางประมาณ 14:00–14:30 น.
  <br />
  🏡 กลับถึงที่พักประมาณ 16:00 น.
  <br />
  🍚 อาหารเย็นประมาณ 18:00 น.
  ที่ร้านกาแฟ Laklai View
</p>
        </div>

        <span className="shrink-0 font-bold text-green-700">
          ฿{natureExperienceTotal.toLocaleString()}
        </span>

      </div>

    </div>
  )}

    <div className="flex items-center justify-between gap-4 border-t border-green-200 pt-4">

      <div>
        <p className="text-sm font-medium text-stone-600">
          ยอดที่ต้องชำระ
        </p>

        <p className="text-xs text-stone-500">
  รวมค่าที่พักและกิจกรรมที่เลือก
</p>
      </div>

      <p className="text-3xl font-bold text-green-700 sm:text-4xl">
        ฿{totalPrice.toLocaleString()}
      </p>

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