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

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
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
      // 2. ตรวจสอบจำนวนและอายุผู้เข้าพัก
      // =========================================

      // เด็กอายุ 14 ปีขึ้นไป = ผู้ใหญ่
      const adultChildren = childAges.filter(
        (age) => age >= 14
      ).length;

      // เด็กอายุ 9-13 ปี = เด็กโต
      const olderChildren = childAges.filter(
        (age) => age >= 9 && age <= 13
      ).length;

      // เด็กอายุ 0-8 ปี = เด็กเล็ก
      const youngChildren = childAges.filter(
        (age) => age >= 0 && age <= 8
      ).length;

      // =========================================
      // กฎที่ 1
      // ผู้ใหญ่ 3 คน + เด็กโต = ห้าม
      // =========================================

      if (adults === 3 && olderChildren > 0) {
        alert(
          "ไม่สามารถจองได้\n\n" +
            "ผู้ใหญ่ 3 คนสามารถเข้าพักพร้อมเด็กอายุไม่เกิน 8 ปีได้เท่านั้น\n\n" +
            "เนื่องจากที่พักมีที่นอนเสริม 3 ฟุตเพียง 1 ที่ " +
            "ซึ่งใช้สำหรับผู้ใหญ่คนที่ 3 แล้ว\n\n" +
            "กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง"
        );

        setIsSubmitting(false);
        return;
      }

      // =========================================
      // กฎที่ 2
      // ผู้ใหญ่ 2 + เด็กโต 2 คน = ห้าม
      // =========================================

      if (adults === 2 && olderChildren >= 2) {
        alert(
          "ไม่สามารถจองได้\n\n" +
            "เด็กอายุ 9-13 ปี จำนวน 2 คน " +
            "ไม่สามารถเข้าพักร่วมกับผู้ใหญ่ 2 คนในบ้านหลังเดียวได้\n\n" +
            "กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง"
        );

        setIsSubmitting(false);
        return;
      }

      // =========================================
      // กฎที่ 3
      // ผู้ใหญ่ 4 คน = ห้าม
      // =========================================

      if (adults >= 4) {
        alert(
          "บ้านพักรองรับผู้ใหญ่สูงสุด 3 คนเท่านั้น\n\n" +
            "เนื่องจากมีที่นอนเสริม 3 ฟุตเพียง 1 ที่\n\n" +
            "กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง"
        );

        setIsSubmitting(false);
        return;
      }

      // =========================================
      // กฎที่ 4
      // เด็ก 14 ปีขึ้นไปถือเป็นผู้ใหญ่
      // =========================================

      const effectiveAdults =
        adults + adultChildren;

      if (effectiveAdults > 3) {
        alert(
          "ไม่สามารถจองบ้านพักหลังเดียวได้\n\n" +
            "เด็กอายุ 14 ปีขึ้นไปจะคิดเป็นผู้ใหญ่\n\n" +
            "จำนวนผู้ใหญ่ที่ต้องรองรับเกินความจุของบ้านพัก\n\n" +
            "กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง"
        );

        setIsSubmitting(false);
        return;
      }

      // =========================================
      // กฎที่ 5
      // ผู้ใหญ่ 3 คน + เด็กเล็กได้สูงสุด 1 คน
      // =========================================

      if (
        adults === 3 &&
        youngChildren > 1
      ) {
        alert(
          "ไม่สามารถจองได้\n\n" +
            "เมื่อมีผู้ใหญ่ 3 คน สามารถเข้าพักพร้อมเด็กอายุไม่เกิน 8 ปีได้เพียง 1 คนเท่านั้น\n\n" +
            "เนื่องจากที่นอนเสริม 3 ฟุตถูกใช้สำหรับผู้ใหญ่คนที่ 3 แล้ว\n\n" +
            "กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง"
        );

        setIsSubmitting(false);
        return;
      }

      // =========================================
      // กฎที่ 6
      // จำนวนผู้เข้าพักทั้งหมดต้องไม่เกิน 4 คน
      // =========================================

      const totalGuests =
        adults + childAges.length;

      if (totalGuests > 4) {
        alert(
          "ไม่สามารถจองบ้านพักหลังเดียวได้\n\n" +
            "จำนวนผู้เข้าพักเกิน 4 คน\n\n" +
            "กรุณาเลือกบ้านพักเพิ่มอีก 1 หลัง"
        );

        setIsSubmitting(false);
        return;
      }

      // =========================================
      // 3. ตรวจสอบวันว่างกับฐานข้อมูล
      // =========================================

      console.log("กำลังตรวจสอบวันว่าง...");

      const availabilityResponse = await fetch(
        "/api/bookings/check-availability",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
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

      // =========================================
      // 4. ถ้าวันไม่ว่าง
      // =========================================

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
      // 5. สร้าง Booking Code
      // =========================================

      const now = new Date();

      const bookingCode =
        "LKV-" +
        now
          .getFullYear()
          .toString()
          .slice(-2) +
        String(now.getMonth() + 1).padStart(
          2,
          "0"
        ) +
        String(now.getDate()).padStart(
          2,
          "0"
        ) +
        "-" +
        Date.now().toString().slice(-4);

      // =========================================
      // 6. สร้าง Booking
      // =========================================

      const booking = await createBooking({
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
        booking_status: "pending",
        payment_status: "waiting",
        slip_url: "",
        booking_code: bookingCode,
      });

      console.log(
        "บันทึกการจองสำเร็จ =",
        booking
      );

      // =========================================
      // 7. ส่ง Email แจ้งรับคำขอจอง
      // =========================================

      const customerEmail =
        email.trim();

      const emailResponse =
        await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email: customerEmail,
            customerEmail,
            guestName,
            roomName: room.title,
            checkIn,
            checkOut,
            totalPrice,
            bookingCode,
            adults,
            childAges,
          }),
        });

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
      // 8. ไปหน้าชำระเงิน
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
                  setCheckIn(e.target.value);

                  if (
                    checkOut &&
                    e.target.value >= checkOut
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
                min={checkIn || undefined}
                onChange={(e) =>
                  setCheckOut(e.target.value)
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
                  onChange={(e) => {
                    const newAdults =
                      Number(e.target.value);

                    setAdults(newAdults);

                    if (newAdults === 3) {
                      setChildAges(
                        (current) =>
                          current.map((age) =>
                            age > 8 ? 8 : age
                          )
                      );
                    }
                  }}
                  className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  <option value={1}>
                    1 คน
                  </option>

                  <option value={2}>
                    2 คน
                  </option>

                  <option value={3}>
                    3 คน
                  </option>
                </select>
              </div>

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
                  onChange={(e) => {
                    const count =
                      Number(e.target.value);

                    setChildren(count);

                    setChildAges((current) => {
                      const next = [...current];

                      while (
                        next.length < count
                      ) {
                        next.push(8);
                      }

                      return next.slice(
                        0,
                        count
                      );
                    });
                  }}
                  className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
                >
                  {[0, 1, 2].map((n) => {
                    const maxChildren =
                      adults === 3 ? 1 : 2;

                    if (
                      n > maxChildren
                    ) {
                      return null;
                    }

                    return (
                      <option
                        key={n}
                        value={n}
                      >
                        {n} คน
                      </option>
                    );
                  })}
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
                          onChange={(e) => {
                            const newAges =
                              [...childAges];

                            newAges[index] =
                              Number(
                                e.target.value
                              );

                            setChildAges(
                              newAges
                            );
                          }}
                          className="min-h-12 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-black"
                        >
                          {Array.from(
                            {
                              length: 18,
                            },
                            (_, age) => (
                              <option
                                key={age}
                                value={age}
                              >
                                {age} ปี
                              </option>
                            )
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
                  {bookingResult?.nights ?? 0} คืน
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 text-sm text-stone-600">
                <span>
                  ราคาปกติ
                </span>

                <span className="line-through text-stone-400">
                  ฿
                  {bookingResult?.roomTotal?.toLocaleString() ??
                    "0"}
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