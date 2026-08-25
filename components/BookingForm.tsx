"use client";

import { calculatePrice } from "@/utils/calculatePrice";
import { useMemo, useState } from "react";
import { createBooking } from "@/lib/booking";
import type { Room } from "@/types/room";
import BookingPolicy from "@/components/BookingPolicy";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

type Props = {
  room: Room;
};

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

  const totalPrice = bookingResult?.grandTotal ?? 0;

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

      const now = new Date();

      const bookingCode =
        "LKV-" +
        now
          .getFullYear()
          .toString()
          .slice(-2) +
        String(
          now.getMonth() + 1
        ).padStart(2, "0") +
        String(
          now.getDate()
        ).padStart(2, "0") +
        "-" +
        Date.now()
          .toString()
          .slice(-4);

      // =========================================
      // 5. สร้าง Booking
      // =========================================

      const booking =
        await createBooking({
          room_id: room.id,
          guest_name:
            guestName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          check_in: checkIn,
          check_out: checkOut,
          adults,
          children,
          child_ages: childAges,
          total_price: totalPrice,
          booking_status: "pending",
          payment_status: "waiting",
          slip_url: "",
          booking_code:
            bookingCode,
        });

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

      window.location.href =
        `/payment/${bookingCode}`;
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
                  {bookingResult?.nights ??
                    0}{" "}
                  คืน
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
                <span>
                  ราคาปกติ
                </span>

                <span className="line-through text-stone-400">
  ฿{normalPriceTotal.toLocaleString()}
</span>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-green-200 pt-4">

                <div>
                  <p className="text-sm font-medium text-stone-600">
                    ยอดที่ต้องชำระ
                  </p>

                  <p className="text-xs text-stone-500">
                    รวมค่าที่พักทั้งหมด
                  </p>
                </div>

                <p className="text-3xl font-bold text-green-700 sm:text-4xl">
                  ฿
                  {totalPrice.toLocaleString()}
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