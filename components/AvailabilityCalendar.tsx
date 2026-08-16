"use client";

import { useEffect, useMemo, useState } from "react";

type BlockedDate = string;

type Props = {
  roomId: string;
  admin?: boolean;
  onSelectDate?: (date: string) => void;

  checkIn: string;
  checkOut: string;

  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
};

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getMonthName(date: Date) {
  return date.toLocaleDateString("th-TH", {
    month: "long",
    year: "numeric",
  });
}

export default function AvailabilityCalendar({
  roomId,
  admin = false,
  onSelectDate,
  checkIn,
  checkOut,
  onCheckInChange,
  onCheckOutChange,
}: Props) {
  const today = useMemo(() => {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  }, []);

  const [currentMonth, setCurrentMonth] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  // =========================================
  // โหลดข้อมูลสถานะการจอง
  // =========================================

  useEffect(() => {
    async function loadAvailability() {
      try {
        setLoading(true);

        const month =
          `${currentMonth.getFullYear()}-` +
          `${String(currentMonth.getMonth() + 1).padStart(2, "0")}`;

        const response = await fetch(
          `/api/availability?roomId=${roomId}&month=${month}`,
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "ไม่สามารถโหลดปฏิทินได้"
          );
        }

        setBookedDates(data.bookedDates ?? []);
        setBlockedDates(data.blockedDates ?? []);

        console.log(
          "CALENDAR AVAILABILITY =",
          data
        );
      } catch (error) {
        console.error(
          "CALENDAR ERROR =",
          error
        );
      } finally {
        setLoading(false);
      }
    }

    loadAvailability();
  }, [roomId, currentMonth]);

  // =========================================
  // วันที่ถูกปิดรับจอง
  // =========================================

  const blockedDateSet = useMemo(() => {
  return new Set(blockedDates);
}, [blockedDates]);

  // =========================================
  // จำนวนวันในเดือน
  // =========================================

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(
      year,
      month,
      1
    );

    const lastDay = new Date(
      year,
      month + 1,
      0
    );

    const days: (Date | null)[] = [];

    // วันอาทิตย์ = 0
    const startDay = firstDay.getDay();

    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    for (
      let day = 1;
      day <= lastDay.getDate();
      day++
    ) {
      days.push(
        new Date(year, month, day)
      );
    }

    return days;
  }, [currentMonth]);

  // =========================================
  // ตรวจสถานะวันที่
  // =========================================

  function getDateStatus(dateString: string) {
    if (bookedDates.includes(dateString)) {
      return "booked";
    }

    if (blockedDateSet.has(dateString)) {
  return "blocked";
}

    return "available";
  }

  // =========================================
  // กดวันที่
  // =========================================

  function handleDateClick(date: Date) {
    const dateString = formatDate(date);

    // ห้ามเลือกวันที่ผ่านมาแล้ว
    if (date < today) {
      return;
    }

    const status = getDateStatus(dateString);

    // จองแล้ว
    if (status === "booked") {
      return;
    }

    // ปิดรับจอง
    if (status === "blocked") {
      return;
    }

    // =======================================
    // ยังไม่มีวันเข้า
    // =======================================

    if (!checkIn) {
      onCheckInChange(dateString);
      onCheckOutChange("");
      return;
    }

    // =======================================
    // มีวันเข้าแล้ว
    // =======================================

    if (!checkOut) {
      if (dateString <= checkIn) {
        onCheckInChange(dateString);
        onCheckOutChange("");
        return;
      }

      // ตรวจว่าระหว่างวันเข้า-วันออก
      // มีวันที่ถูกจองหรือปิดหรือไม่
      const start = new Date(
        `${checkIn}T00:00:00`
      );

      const end = new Date(
        `${dateString}T00:00:00`
      );

      const cursor = new Date(start);

      cursor.setDate(
        cursor.getDate() + 1
      );

      while (cursor < end) {
        const cursorString =
          formatDate(cursor);

        const cursorStatus =
          getDateStatus(cursorString);

        if (
          cursorStatus === "booked" ||
          cursorStatus === "blocked"
        ) {
          alert(
            "ไม่สามารถเลือกช่วงวันที่นี้ได้\n\n" +
            "มีวันที่ถูกจองหรือปิดรับจองอยู่ระหว่างช่วงวันที่ที่เลือก"
          );

          return;
        }

        cursor.setDate(
          cursor.getDate() + 1
        );
      }

      onCheckOutChange(dateString);
      return;
    }

    // =======================================
    // ถ้ามีครบแล้ว เริ่มเลือกใหม่
    // =======================================

    onCheckInChange(dateString);
    onCheckOutChange("");
  }

  // =========================================
  // เปลี่ยนเดือน
  // =========================================

  function previousMonth() {
    const previous = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() - 1,
      1
    );

    const currentMonthStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (previous < currentMonthStart) {
      return;
    }

    setCurrentMonth(previous);
  }

  function nextMonth() {
    setCurrentMonth(
      new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        1
      )
    );
  }

  // =========================================
  // UI
  // =========================================

  return (
    <div className="rounded-3xl border border-stone-700 bg-stone-950 p-5 text-white shadow-xl md:p-7">

      {/* หัวปฏิทิน */}

      <div className="mb-6 flex items-center justify-between gap-4">

        <button
          type="button"
          onClick={previousMonth}
          className="rounded-xl border border-stone-700 bg-stone-900 px-4 py-2 text-lg text-white transition hover:bg-stone-800"
        >
          ←
        </button>

        <div className="text-center">

          <h3 className="text-xl font-bold text-white md:text-2xl">
            {getMonthName(currentMonth)}
          </h3>

          {loading && (
            <p className="mt-1 text-sm text-emerald-400">
              กำลังโหลดข้อมูล...
            </p>
          )}

        </div>

        <button
          type="button"
          onClick={nextMonth}
          className="rounded-xl border border-stone-700 bg-stone-900 px-4 py-2 text-lg text-white transition hover:bg-stone-800"
        >
          →
        </button>

      </div>

      {/* คำอธิบายสถานะ */}

      <div className="mb-6 flex flex-wrap justify-center gap-3 text-sm">

        <div className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          <span className="text-white">
            ว่าง
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-red-600" />
          <span className="text-white">
            จองแล้ว
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-stone-900 px-4 py-2">
          <span className="h-3 w-3 rounded-full bg-stone-500" />
          <span className="text-white">
            🔒 ปิดรับจอง
          </span>
        </div>

      </div>

      {/* วันในสัปดาห์ */}

      <div className="mb-2 grid grid-cols-7 gap-2 text-center text-sm font-bold text-stone-300">

        {[
          "อา.",
          "จ.",
          "อ.",
          "พ.",
          "พฤ.",
          "ศ.",
          "ส.",
        ].map((day) => (
          <div key={day}>
            {day}
          </div>
        ))}

      </div>

      {/* ตารางวันที่ */}

      <div className="grid grid-cols-7 gap-2">

        {calendarDays.map((date, index) => {

          if (!date) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[76px]"
              />
            );
          }

          const dateString =
            formatDate(date);

          const status =
            getDateStatus(dateString);

          const isPast =
            date < today;

          const isCheckIn =
            checkIn === dateString;

          const isCheckOut =
            checkOut === dateString;

          const isSelected =
            isCheckIn || isCheckOut;

          let className =
            "min-h-[76px] rounded-2xl border p-3 text-left transition";

          if (isPast) {
            className +=
              " cursor-not-allowed border-stone-800 bg-stone-900 text-stone-600";
          } else if (status === "booked") {
            className +=
              " cursor-not-allowed border-red-700 bg-red-600 text-white";
          } else if (status === "blocked") {
            className +=
              " cursor-not-allowed border-stone-600 bg-stone-600 text-white";
          } else {
            className +=
              " cursor-pointer border-stone-700 bg-stone-900 text-white hover:border-emerald-400 hover:bg-stone-800";
          }

          if (isSelected) {
            className +=
              " ring-4 ring-emerald-400";
          }

          return (
            <button
              key={dateString}
              type="button"
              disabled={
                isPast ||
                status === "booked" ||
                status === "blocked"
              }
              onClick={() =>
                handleDateClick(date)
              }
              className={className}
            >

              <div className="text-lg font-bold">
                {date.getDate()}
              </div>

              <div className="mt-2 text-xs font-semibold">

                {isCheckIn && (
                  <span className="text-emerald-300">
                    วันเข้า
                  </span>
                )}

                {isCheckOut && (
                  <span className="text-emerald-300">
                    วันออก
                  </span>
                )}

                {!isSelected &&
                  status === "available" && (
                    <span className="text-emerald-400">
                      ว่าง
                    </span>
                  )}

                {!isSelected &&
                  status === "booked" && (
                    <span className="text-white">
                      จองแล้ว
                    </span>
                  )}

                {!isSelected &&
                  status === "blocked" && (
                    <span className="text-white">
                      🔒 ปิดรับจอง
                    </span>
                  )}

                {isPast && (
                  <span className="text-stone-500">
                    ผ่านแล้ว
                  </span>
                )}

              </div>

            </button>
          );
        })}

      </div>

      {/* คำแนะนำ */}

      <div className="mt-6 rounded-2xl border border-amber-700/70 bg-stone-900 p-4 text-sm leading-6 text-amber-300">

        <strong>
          วิธีเลือกวันเข้าพัก
        </strong>

        <br />

        1. กดวันที่สีเขียวที่ต้องการเข้าพัก

        <br />

        2. กดวันที่สีเขียวที่ต้องการออก

        <br />

        3. วันที่สีแดงคือมีผู้จองแล้ว

        <br />

        4. วันที่สีเทาคือ 🔒 ปิดรับจอง

      </div>

    </div>
  );
}