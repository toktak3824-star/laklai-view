"use client";

import { calculatePrice } from "@/utils/calculatePrice";
import { useEffect, useMemo, useState } from "react";
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
const handleCalendarDateSelect = (date: string) => {
  // ถ้ายังไม่ได้เลือกวันเข้า
  if (!checkIn) {
    setCheckIn(date);
    setCheckOut("");
    return;
  }

  // ถ้าเลือกวันเข้าแล้ว แต่ยังไม่ได้เลือกวันออก
  if (!checkOut) {
    if (date <= checkIn) {
      alert("วันออกต้องเป็นหลังวันเข้าพัก");
      return;
    }

    setCheckOut(date);
    return;
  }

  // ถ้าเลือกครบแล้ว และกดวันที่ใหม่
  // ให้เริ่มเลือกวันเข้าใหม่
  setCheckIn(date);
  setCheckOut("");
};
  const [adults, setAdults] = useState(room.defaultGuests);
  const [children, setChildren] = useState(0);

  const [childAges, setChildAges] = useState<number[]>([]);

  const [guestName, setGuestName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  
  const isHoliday = checkIn
  ? (() => {
      const day = new Date(checkIn).getDay();
      return day === 0 || day === 6;
    })()
  : false;

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

    return (
    <div className="space-y-6 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">

      <div>
        <h2 className="text-2xl font-bold text-stone-800">
          จองที่พัก
        </h2>

        <p className="mt-1 text-sm text-stone-500">
          กรุณากรอกข้อมูลให้ครบถ้วน
        </p>

      </div>

      {/* ========================================= */}
{/* ปฏิทินสถานะการจอง */}
{/* ========================================= */}

<div className="rounded-2xl border border-stone-700 bg-stone-950 p-6">

  <AvailabilityCalendar
    roomId={room.id}
    checkIn={checkIn}
    checkOut={checkOut}
    onCheckInChange={setCheckIn}
    onCheckOutChange={setCheckOut}
  />

</div>


{/* ========================================= */}
{/* วันที่เข้าพัก / วันที่ออก */}
{/* ========================================= */}

<div className="mt-5 space-y-4">

  <div>
    <label className="mb-2 block text-sm font-medium text-stone-700">
      วันเข้าพัก
    </label>

    <input
      type="date"
      value={checkIn}
      onChange={(e) => setCheckIn(e.target.value)}
      className="w-full rounded-xl border border-stone-300 bg-white p-3 text-black"
    />
  </div>

  <div>
    <label className="mb-2 block text-sm font-medium text-stone-700">
      วันออก
    </label>

    <input
      type="date"
      value={checkOut}
      onChange={(e) => setCheckOut(e.target.value)}
      className="w-full rounded-xl border border-stone-300 bg-white p-3 text-black"
    />
  </div>

</div>

      <div className="grid gap-4 md:grid-cols-2">

        <div>
  <label className="mb-2 block text-sm font-medium text-stone-700">
    จำนวนผู้ใหญ่
  </label>

  <select
    value={adults}
    onChange={(e) => {
      const newAdults = Number(e.target.value);

      setAdults(newAdults);

      // ถ้าเลือกผู้ใหญ่ 3 คน
      // เด็กที่สามารถเข้าพักได้ต้องเป็นเด็กอายุไม่เกิน 8 ปีเท่านั้น
      if (newAdults === 3) {
        setChildAges((current) =>
          current.map((age) => (age > 8 ? 8 : age))
        );
      }
    }}
    className="w-full rounded-xl border border-stone-300 bg-white p-3 text-black"
  >
    <option value={1}>1 คน</option>
    <option value={2}>2 คน</option>
    <option value={3}>3 คน</option>
  </select>
</div>

        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700">
            เด็ก
          </label>
          {children > 0 && (
  <div className="space-y-3">
    <p className="text-sm font-semibold text-stone-700">
      อายุเด็ก
    </p>

    {childAges.map((age, index) => (
      <div key={index}>
        <label className="mb-1 block text-sm text-stone-600">
          เด็กคนที่ {index + 1}
        </label>

        <select
          value={age}
          onChange={(e) => {
            const newAges = [...childAges];
            newAges[index] = Number(e.target.value);
            setChildAges(newAges);
          }}
          className="w-full rounded-xl border border-stone-300 bg-white p-3 text-black"
        >
          {Array.from({ length: 18 }, (_, age) => (
            <option key={age} value={age}>
              {age} ปี
            </option>
          ))}
        </select>
      </div>
    ))}
  </div>
)}
          <select
  value={children}
  onChange={(e) => {
  const count = Number(e.target.value);

  setChildren(count);

  setChildAges((current) => {
    const next = [...current];

    while (next.length < count) {
      next.push(8);
    }

    return next.slice(0, count);
  });
}}
  className="w-full rounded-xl border border-stone-300 bg-white p-3 text-black"
>
  {[0, 1, 2].map((n) => {
  // ผู้ใหญ่ 3 คน รับเด็กได้สูงสุด 1 คน
  const maxChildren =
    adults === 3 ? 1 : 2;

  if (n > maxChildren) {
    return null;
  }

  return (
    <option key={n} value={n}>
      {n} คน
    </option>
  );
})}
</select>
        </div>

      </div>

      <div className="space-y-4">

        <input
          type="text"
          placeholder="ชื่อผู้จอง"
          value={guestName}
          onChange={(e)=>setGuestName(e.target.value)}
          className="w-full rounded-xl border border-stone-300 bg-white p-3 text-black placeholder:text-stone-400"
        />
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-stone-300 bg-white p-3 text-black placeholder:text-stone-400"
        />
        <input
          type="tel"
          placeholder="เบอร์โทรศัพท์"
          value={phone}
          onChange={(e)=>setPhone(e.target.value)}
          className="w-full rounded-xl border border-stone-300 bg-white p-3 text-black placeholder:text-stone-400"
        />

      </div>

      <div className="rounded-xl bg-stone-100 p-5 space-y-2">

        <div className="flex justify-between">
  <span>ราคาปกติ</span>

  <span className="line-through text-gray-400">
    ฿{bookingResult?.roomTotal.toLocaleString() ?? 0}
  </span>
</div>

<div className="flex justify-between text-xl font-bold">
  <span>ราคาที่ต้องชำระ</span>

  <span className="text-green-700">
    <p>จำนวนคืน : {bookingResult?.nights}</p>

<p>ค่าห้อง : {bookingResult?.roomTotal}</p>

<p>รวมทั้งหมด : {bookingResult?.grandTotal}</p>
    ฿{totalPrice.toLocaleString()}
  </span>
</div>

      </div>
      <BookingPolicy />

<div className="rounded-xl border border-stone-200 bg-white p-4">

  <label className="flex cursor-pointer items-start gap-3">

    <input
      type="checkbox"
      checked={acceptedPolicy}
      onChange={(e) =>
        setAcceptedPolicy(e.target.checked)
      }
      className="mt-1 h-5 w-5"
    />

    <span className="text-sm leading-6 text-stone-700">
      ข้าพเจ้าได้อ่านและเข้าใจ
      ข้อตกลงและเงื่อนไขการเข้าพักทั้งหมดแล้ว
      และยอมรับเงื่อนไขของหลักลาย View
    </span>

  </label>

</div>
           <button
  type="button"
  disabled={!acceptedPolicy}
  className="w-full rounded-xl bg-green-700 py-4 text-lg font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:bg-stone-300"        
  
  onClick={async () => {
  try {
    // =========================================
    // 1. ตรวจข้อมูลเบื้องต้น
    // =========================================

    if (!checkIn || !checkOut) {
      alert("กรุณาเลือกวันเข้าพักและวันออก");
      return;
    }

    if (checkIn >= checkOut) {
      alert("วันออกต้องมากกว่าวันเข้าพัก");
      return;
    }

    if (!guestName.trim()) {
      alert("กรุณากรอกชื่อผู้จอง");
      return;
    }

    if (!email.trim()) {
      alert("กรุณากรอกอีเมล");
      return;
    }

    if (!phone.trim()) {
      alert("กรุณากรอกเบอร์โทรศัพท์");
      return;
    }
// =========================================
// ตรวจสอบจำนวนและอายุผู้เข้าพัก
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

  return;
}
    // =========================================
    // 2. ตรวจสอบวันว่างกับฐานข้อมูล
    // =========================================

    console.log("กำลังตรวจสอบวันว่าง...");
    console.log({
      roomId: room.id,
      checkIn,
      checkOut,
    });

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
    // 3. ถ้าวันไม่ว่าง
    // =========================================

    if (
  !availabilityResponse.ok ||
  !availabilityResult.available
) {
  if (
    availabilityResult.reason === "guest_limit"
  ) {
    alert(
      "❌ ไม่สามารถจองบ้านพักหลังนี้ได้\n\n" +
      availabilityResult.message
    );
  } else if (
    availabilityResult.reason === "booked"
  ) {
    alert(
      "🔴 วันที่ที่คุณเลือกมีการจองแล้ว\n\nกรุณาเลือกวันอื่น"
    );
  } else if (
    availabilityResult.reason === "blocked"
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

  return;
}

    // =========================================
    // 4. ผ่านการตรวจสอบ
    // =========================================

    console.log(
      "✅ วันที่ว่าง สามารถสร้าง Booking ได้"
    );

    // =========================================
    // 5. สร้าง Booking Code
    // =========================================

    const now = new Date();

    const bookingCode =
      "LKV-" +
      now.getFullYear().toString().slice(-2) +
      String(now.getMonth() + 1).padStart(2, "0") +
      String(now.getDate()).padStart(2, "0") +
      "-" +
      Date.now().toString().slice(-4);

    // =========================================
    // 6. สร้าง Booking
    // =========================================

    const booking = await createBooking({
  room_id: room.id,
  guest_name: guestName,
  email,
  phone,
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

    console.log(
      "กำลังส่ง Email..."
    );

    const emailResponse = await fetch(
      "/api/send-email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  email,
  guestName,
  roomName: room.title,
  checkIn,
  checkOut,
  totalPrice,
  bookingCode,

  // ข้อมูลผู้เข้าพัก
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
    // 8. ไปหน้าชำระเงิน
    // =========================================

    window.location.href =
      `/payment/${bookingCode}`;

  } catch (error) {
    console.error(
      "BOOKING ERROR =",
      error
    );

    alert(
      "เกิดข้อผิดพลาดในการจอง กรุณาลองใหม่อีกครั้ง"
    );
  }
}}
> 
  ยืนยันการจอง
</button>

    </div>
  );
}