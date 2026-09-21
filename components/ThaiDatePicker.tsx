"use client";

import { useMemo, useState } from "react";

type ThaiDatePickerProps = {
  label: string;
  value: string;
  min?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
};

const THAI_MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

const THAI_MONTHS_SHORT = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

const THAI_DAYS = [
  "อา.",
  "จ.",
  "อ.",
  "พ.",
  "พฤ.",
  "ศ.",
  "ส.",
];

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseDate(value: string) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value
    .split("-")
    .map(Number);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function formatThaiDate(value: string) {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  const day = date.getDate();
  const month = THAI_MONTHS_SHORT[date.getMonth()];
  const year = date.getFullYear() + 543;

  return `${day}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${year}`;
}

function formatThaiLongDate(value: string) {
  const date = parseDate(value);

  if (!date) {
    return "";
  }

  const day = date.getDate();
  const month = THAI_MONTHS[date.getMonth()];
  const year = date.getFullYear() + 543;

  return `${day} ${month} ${year}`;
}

function getCalendarDays(
  year: number,
  month: number
): (Date | null)[] {
  const firstDay = new Date(year, month, 1);

  const lastDay = new Date(
    year,
    month + 1,
    0
  );

  const days: (Date | null)[] = [];

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
}

export default function ThaiDatePicker({
  label,
  value,
  min,
  onChange,
  disabled = false,
}: ThaiDatePickerProps) {
  const today = useMemo(() => {
    const now = new Date();

    return new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
  }, []);

  const selectedDate = parseDate(value);
  const minDate = parseDate(min || "");

  const [isOpen, setIsOpen] = useState(false);

  const [currentMonth, setCurrentMonth] =
    useState<Date>(
      selectedDate
        ? new Date(
            selectedDate.getFullYear(),
            selectedDate.getMonth(),
            1
          )
        : new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          )
    );

  const calendarDays = useMemo(
    () =>
      getCalendarDays(
        currentMonth.getFullYear(),
        currentMonth.getMonth()
      ),
    [currentMonth]
  );

  function selectDate(date: Date) {
    const dateValue = formatDate(date);

    if (date < today) {
      return;
    }

    if (minDate && date < minDate) {
      return;
    }

    onChange(dateValue);
    setIsOpen(false);
  }

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

  return (
    <div className="relative">
      {/* ==================================================
          LABEL
      ================================================== */}

      <label className="mb-2 block text-sm font-semibold text-amber-100">
        {label}
      </label>

      {/* ==================================================
          DISPLAY INPUT
      ================================================== */}

      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          !disabled && setIsOpen((open) => !open)
        }
        className={`flex min-h-14 w-full items-center justify-between rounded-2xl border px-4 text-left transition ${
          disabled
            ? "cursor-not-allowed border-stone-800 bg-stone-900 text-stone-600"
            : "border-stone-600 bg-stone-950 text-white hover:border-emerald-400"
        }`}
      >
        <div>
          {value ? (
            <>
              <div className="text-base font-semibold">
                📅 {formatThaiDate(value)}
              </div>

              <div className="mt-0.5 text-xs text-stone-400">
                {formatThaiLongDate(value)}
              </div>
            </>
          ) : (
            <span className="text-stone-500">
              เลือกวัน{label.replace("วัน", "")}
            </span>
          )}
        </div>

        <span className="text-xl text-stone-400">
          ▾
        </span>
      </button>

      {/* ==================================================
          CALENDAR
      ================================================== */}

      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-3xl border border-stone-700 bg-stone-950 p-4 shadow-2xl sm:p-5">
          {/* HEADER */}

          <div className="mb-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={previousMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-700 bg-stone-900 text-lg text-white transition hover:bg-stone-800"
            >
              ←
            </button>

            <div className="text-center">
              <p className="text-lg font-bold text-white">
                {THAI_MONTHS[
                  currentMonth.getMonth()
                ]}{" "}
                {currentMonth.getFullYear() + 543}
              </p>

              <p className="mt-0.5 text-xs text-stone-500">
                {currentMonth.getFullYear()}
              </p>
            </div>

            <button
              type="button"
              onClick={nextMonth}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-700 bg-stone-900 text-lg text-white transition hover:bg-stone-800"
            >
              →
            </button>
          </div>

          {/* WEEK DAYS */}

          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-400 sm:gap-2 sm:text-sm">
            {THAI_DAYS.map((day) => (
              <div key={day} className="py-2">
                {day}
              </div>
            ))}
          </div>

          {/* DAYS */}

          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarDays.map(
              (date, index) => {
                if (!date) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="aspect-square"
                    />
                  );
                }

                const dateValue =
                  formatDate(date);

                const isPast =
                  date < today;

                const isBeforeMin =
                  minDate
                    ? date < minDate
                    : false;

                const isDisabled =
                  isPast || isBeforeMin;

                const isSelected =
                  value === dateValue;

                const isToday =
                  formatDate(today) ===
                  dateValue;

                return (
                  <button
                    key={dateValue}
                    type="button"
                    disabled={isDisabled}
                    onClick={() =>
                      selectDate(date)
                    }
                    className={`aspect-square rounded-xl border text-sm font-semibold transition sm:text-base ${
                      isDisabled
                        ? "cursor-not-allowed border-stone-900 bg-stone-900 text-stone-700"
                        : isSelected
                        ? "border-emerald-400 bg-emerald-600 text-white shadow-lg"
                        : isToday
                        ? "border-amber-400 bg-stone-900 text-amber-300 hover:bg-stone-800"
                        : "border-stone-800 bg-stone-900 text-white hover:border-emerald-400 hover:bg-stone-800"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              }
            )}
          </div>

          {/* FOOTER */}

          <div className="mt-4 rounded-2xl border border-stone-800 bg-stone-900 p-3 text-center text-xs leading-5 text-stone-400">
            <span className="text-emerald-400">
              ●
            </span>{" "}
            วันที่เลือกได้
            <span className="mx-2">•</span>
            <span className="text-amber-300">
              ●
            </span>{" "}
            วันนี้
          </div>
        </div>
      )}
    </div>
  );
}