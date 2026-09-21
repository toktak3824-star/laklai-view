"use client";

import { useEffect, useMemo, useState } from "react";
import { rooms } from "../data/rooms";
import { getStayPrice } from "../utils/getNightlyPrice";
import ThaiDatePicker from "./ThaiDatePicker";

type AvailabilityStatus = "available" | "booked" | "blocked" | "loading";

type RoomAvailability = {
  roomId: string;
  status: AvailabilityStatus;
  reason?: string;
};

type MonthlyAvailability = {
  bookedDates: string[];
  blockedDates: string[];
};

function formatDate(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function parseDate(dateString: string) {
  return new Date(`${dateString}T00:00:00`);
}

function getMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function getDatesBetween(
  checkIn: string,
  checkOut: string
): string[] {
  if (!checkIn || !checkOut) {
    return [];
  }

  const start = parseDate(checkIn);
  const end = parseDate(checkOut);

  if (start >= end) {
    return [];
  }

  const dates: string[] = [];
  const cursor = new Date(start);

  /*
   * ตรวจเฉพาะ "คืนที่เข้าพัก"
   *
   * ตัวอย่าง:
   * Check-in 20 ก.ย.
   * Check-out 22 ก.ย.
   *
   * ต้องตรวจ:
   * 20 ก.ย.
   * 21 ก.ย.
   *
   * ไม่ต้องตรวจ 22 ก.ย. เพราะเป็นวันออก
   */
  while (cursor < end) {
    dates.push(formatDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

function getMonthsBetween(
  checkIn: string,
  checkOut: string
): string[] {
  if (!checkIn || !checkOut) {
    return [];
  }

  const start = parseDate(checkIn);
  const end = parseDate(checkOut);

  if (start >= end) {
    return [];
  }

  const months = new Set<string>();

  const cursor = new Date(
    start.getFullYear(),
    start.getMonth(),
    1
  );

  const lastMonth = new Date(
    end.getFullYear(),
    end.getMonth(),
    1
  );

  while (cursor <= lastMonth) {
    months.add(getMonthKey(cursor));

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return Array.from(months);
}

function formatThaiDate(dateString: string) {
  if (!dateString) {
    return "";
  }

  const date = parseDate(dateString);

  return date.toLocaleDateString("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function getSelectedStayPricing(
  room: (typeof rooms)[number],
  checkIn: string,
  checkOut: string
) {
  const result = getStayPrice(
    room,
    checkIn,
    checkOut
  );

  const nightlyPrices = result.breakdown.map(
    (item) => item.price
  );

  const originalPrices = result.breakdown.map(
    (item) =>
      item.type === "holiday"
        ? room.pricing.originalHoliday ??
          room.pricing.holiday
        : room.pricing.originalWeekday ??
          room.pricing.weekday
  );

  const minPrice =
    nightlyPrices.length > 0
      ? Math.min(...nightlyPrices)
      : 0;

  const maxPrice =
    nightlyPrices.length > 0
      ? Math.max(...nightlyPrices)
      : 0;

  const minOriginalPrice =
    originalPrices.length > 0
      ? Math.min(...originalPrices)
      : 0;

  const maxOriginalPrice =
    originalPrices.length > 0
      ? Math.max(...originalPrices)
      : 0;

  const hasDifferentNightlyPrices =
    new Set(nightlyPrices).size > 1;

  const hasDiscount =
    nightlyPrices.some(
      (price, index) =>
        price < originalPrices[index]
    );

  return {
    roomTotal: result.roomTotal,
    minPrice,
    maxPrice,
    minOriginalPrice,
    maxOriginalPrice,
    hasDifferentNightlyPrices,
    hasDiscount,
  };
}

export default function AllRoomsAvailability() {
  const today = useMemo(() => {
    const now = new Date();

    return formatDate(
      new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )
    );
  }, []);

  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [availability, setAvailability] = useState<
    RoomAvailability[]
  >([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /*
   * ----------------------------------------------------
   * ตรวจสอบว่าช่วงวันที่ถูกต้องหรือไม่
   * ----------------------------------------------------
   */
  const dateError = useMemo(() => {
    if (!checkIn || !checkOut) {
      return "";
    }

    if (checkOut <= checkIn) {
      return "วันเช็กเอาต์ต้องเป็นหลังวันเช็กอิน";
    }

    return "";
  }, [checkIn, checkOut]);

  /*
   * ----------------------------------------------------
   * จำนวนคืน
   * ----------------------------------------------------
   */
  const nights = useMemo(() => {
    if (!checkIn || !checkOut || dateError) {
      return 0;
    }

    const start = parseDate(checkIn);
    const end = parseDate(checkOut);

    const difference =
      end.getTime() - start.getTime();

    return Math.round(
      difference / (1000 * 60 * 60 * 24)
    );
  }, [checkIn, checkOut, dateError]);

  /*
   * ----------------------------------------------------
   * ตรวจสอบบ้านทั้งหมด
   * ----------------------------------------------------
   */
  useEffect(() => {
    let cancelled = false;

    async function checkAllRooms() {
      if (!checkIn || !checkOut || dateError) {
        setAvailability([]);
        return;
      }

      try {
        setLoading(true);
        setError("");

        /*
         * ตั้งสถานะเริ่มต้นเป็นกำลังตรวจสอบ
         */
        setAvailability(
          rooms.map((room) => ({
            roomId: room.id,
            status: "loading",
          }))
        );

        /*
         * วันที่ที่ต้องตรวจ
         */
        const stayDates = getDatesBetween(
          checkIn,
          checkOut
        );

        /*
         * เดือนที่เกี่ยวข้องกับการเข้าพัก
         */
        const months = getMonthsBetween(
          checkIn,
          checkOut
        );

        /*
         * ------------------------------------------------
         * โหลด availability ของทุกบ้าน
         * ------------------------------------------------
         *
         * เราใช้ API เดิมของเว็บไซต์:
         *
         * /api/availability?roomId=...&month=...
         *
         * ไม่สร้างระบบจองใหม่
         */
        const roomResults =
          await Promise.all(
            rooms.map(async (room) => {
              const monthlyData: Record<
                string,
                MonthlyAvailability
              > = {};

              /*
               * โหลดทุกเดือนที่เกี่ยวข้อง
               */
              await Promise.all(
                months.map(async (month) => {
                  const response = await fetch(
                    `/api/availability?roomId=${encodeURIComponent(
                      room.id
                    )}&month=${encodeURIComponent(month)}`,
                    {
                      cache: "no-store",
                    }
                  );

                  if (!response.ok) {
                    throw new Error(
                      `ไม่สามารถตรวจสอบ ${room.title}`
                    );
                  }

                  const data =
                    await response.json();

                  monthlyData[month] = {
                    bookedDates:
                      data.bookedDates ?? [],
                    blockedDates:
                      data.blockedDates ?? [],
                  };
                })
              );

              /*
               * รวมวันที่จองทั้งหมด
               */
              const bookedDates = new Set<string>();
              const blockedDates = new Set<string>();

              Object.values(monthlyData).forEach(
                (data) => {
                  data.bookedDates.forEach((date) =>
                    bookedDates.add(date)
                  );

                  data.blockedDates.forEach((date) =>
                    blockedDates.add(date)
                  );
                }
              );

              /*
               * ตรวจทุกคืนของการเข้าพัก
               */
              const bookedNight = stayDates.find(
                (date) =>
                  bookedDates.has(date)
              );

              const blockedNight = stayDates.find(
                (date) =>
                  blockedDates.has(date)
              );

              if (bookedNight) {
                return {
                  roomId: room.id,
                  status: "booked" as const,
                  reason: `มีการจองวันที่ ${bookedNight}`,
                };
              }

              if (blockedNight) {
                return {
                  roomId: room.id,
                  status: "blocked" as const,
                  reason: `ปิดรับจองวันที่ ${blockedNight}`,
                };
              }

              return {
                roomId: room.id,
                status: "available" as const,
              };
            })
          );

        if (!cancelled) {
          setAvailability(roomResults);
        }
      } catch (error) {
        console.error(
          "ALL ROOMS AVAILABILITY ERROR =",
          error
        );

        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "ไม่สามารถตรวจสอบวันว่างได้"
          );

          setAvailability([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkAllRooms();

    return () => {
      cancelled = true;
    };
  }, [checkIn, checkOut, dateError]);

  /*
   * ----------------------------------------------------
   * ค้นหาสถานะของแต่ละบ้าน
   * ----------------------------------------------------
   */
  function getRoomStatus(roomId: string) {
    return availability.find(
      (item) => item.roomId === roomId
    );
  }

  /*
   * ----------------------------------------------------
   * ไปหน้าจองบ้านนั้น
   * ----------------------------------------------------
   */
  function goToRoom(roomId: string) {
    if (!checkIn || !checkOut) {
      return;
    }

    const params = new URLSearchParams();

    params.set("checkIn", checkIn);
    params.set("checkOut", checkOut);

    window.location.assign(
  `/rooms/${roomId}?${params.toString()}#booking`
);
  }

  return (
    <section
      id="all-rooms-availability"
      className="mt-10 rounded-3xl border border-white/10 bg-stone-950 p-5 text-white shadow-2xl sm:p-7 lg:p-8"
    >
      {/* ==================================================
          HEADER
      ================================================== */}
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-green-300 sm:text-sm">
          LAKLAI VIEW
        </p>

        <h2 className="mt-2 text-2xl font-bold text-amber-50 sm:text-3xl lg:text-4xl">
          เช็กวันว่างของบ้านพัก
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base">
          เลือกวันเข้าพักและวันออก
          แล้วดูได้ทันทีว่าบ้านหลังไหนยังว่าง
        </p>
      </div>

      {/* ==================================================
          DATE SELECTOR
      ================================================== */}
      <div className="mx-auto mt-7 max-w-3xl rounded-3xl border border-stone-700 bg-stone-900 p-4 sm:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* CHECK IN */}
          <div>
            <ThaiDatePicker
              label="วันเข้าพัก"
              value={checkIn}
              min={today}
              onChange={(value) => {
                setCheckIn(value);

                /*
                 * ถ้าเลือกวันเข้าใหม่ที่อยู่หลัง
                 * วันออกเดิม ให้ล้างวันออก
                 */
                if (
                  checkOut &&
                  value >= checkOut
                ) {
                  setCheckOut("");
                }
              }}
            />
          </div>

          {/* CHECK OUT */}
          <div>
            <ThaiDatePicker
              label="วันออก"
              value={checkOut}
              min={checkIn || today}
              onChange={(value) => {
                setCheckOut(value);
              }}
            />
          </div>
        </div>

        {/* DATE ERROR */}
        {dateError && (
          <div className="mt-4 rounded-2xl border border-red-800 bg-red-950/50 p-4 text-sm text-red-300">
            {dateError}
          </div>
        )}

        {/* SELECTED DATE */}
        {checkIn &&
          checkOut &&
          !dateError && (
            <div className="mt-5 rounded-2xl border border-emerald-800/70 bg-emerald-950/40 p-4 text-center">
              <p className="text-sm text-emerald-200">
                วันที่เลือก
              </p>

              <p className="mt-1 text-base font-bold text-white sm:text-lg">
                {formatThaiDate(checkIn)} → {formatThaiDate(checkOut)}
              </p>

              <p className="mt-1 text-sm text-emerald-300">
                {nights} คืน
              </p>
            </div>
          )}
      </div>

      {/* ==================================================
          LOADING
      ================================================== */}
      {loading && (
        <div className="mt-7 rounded-2xl border border-stone-700 bg-stone-900 p-5 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-stone-700 border-t-emerald-400" />

          <p className="mt-3 text-sm text-stone-300">
            กำลังตรวจสอบวันว่างของบ้านพัก...
          </p>
        </div>
      )}

      {/* ==================================================
          ERROR
      ================================================== */}
      {error && !loading && (
        <div className="mt-7 rounded-2xl border border-red-800 bg-red-950/50 p-5 text-center">
          <p className="font-semibold text-red-300">
            ไม่สามารถตรวจสอบวันว่างได้
          </p>

          <p className="mt-2 text-sm text-red-200/80">
            {error}
          </p>

          <button
            type="button"
            onClick={() => {
              /*
               * เปลี่ยนวันที่ไป-กลับหนึ่งครั้งเพื่อ
               * กระตุ้น effect ให้โหลดข้อมูลใหม่
               */
              const currentCheckIn = checkIn;
              setCheckIn("");
              setTimeout(() => {
                setCheckIn(currentCheckIn);
              }, 50);
            }}
            className="mt-4 rounded-full bg-red-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-red-600"
          >
            ลองตรวจสอบอีกครั้ง
          </button>
        </div>
      )}

      {/* ==================================================
          ROOM RESULTS
      ================================================== */}
      {!loading &&
        !error &&
        checkIn &&
        checkOut &&
        !dateError &&
        availability.length > 0 && (
          <div className="mt-7">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-amber-50 sm:text-2xl">
                  บ้านพักที่ยังว่าง
                </h3>

                <p className="mt-1 text-sm text-stone-400">
                  เลือกบ้านที่ต้องการแล้วกดจองได้เลย
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {rooms.map((room) => {
                const result =
                  getRoomStatus(room.id);

                const isAvailable =
                  result?.status === "available";

                const pricing =
                  isAvailable &&
                  checkIn &&
                  checkOut &&
                  !dateError
                    ? getSelectedStayPricing(
                        room,
                        checkIn,
                        checkOut
                      )
                    : null;

                const isBooked =
                  result?.status === "booked";

                const isBlocked =
                  result?.status === "blocked";

                return (
                  <article
                    key={room.id}
                    className={`overflow-hidden rounded-3xl border transition ${
                      isAvailable
                        ? "border-emerald-700/70 bg-stone-900"
                        : "border-stone-700 bg-stone-900/70"
                    }`}
                  >
                    <div className="p-5 sm:p-6">
                      {/* ROOM NAME */}
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-xl font-bold text-amber-50 sm:text-2xl">
                            {room.title}
                          </h4>

                          <p className="mt-1 text-sm italic text-amber-100/60">
                            {room.subtitle}
                          </p>
                        </div>

                        {/* STATUS */}
                        {isAvailable && (
                          <span className="shrink-0 rounded-full bg-emerald-900/70 px-3 py-1.5 text-xs font-bold text-emerald-300">
                            ● ว่าง
                          </span>
                        )}

                        {isBooked && (
                          <span className="shrink-0 rounded-full bg-red-950 px-3 py-1.5 text-xs font-bold text-red-300">
                            ● จองแล้ว
                          </span>
                        )}

                        {isBlocked && (
                          <span className="shrink-0 rounded-full bg-stone-700 px-3 py-1.5 text-xs font-bold text-stone-300">
                            🔒 ปิดรับจอง
                          </span>
                        )}
                      </div>

                      {/* PRICE */}
                      {isAvailable &&
                        pricing && (
                          <div className="mt-5 rounded-2xl border border-green-800/60 bg-green-950/30 p-4">
                            <p className="text-xs text-green-300">
                              ราคาห้องพักตามวันที่เลือก
                            </p>

                            <div className="mt-1 flex flex-wrap items-end gap-3">
                              {pricing.hasDiscount && (
                                <span className="text-sm text-stone-500 line-through">
                                  ฿
                                  {pricing.minOriginalPrice.toLocaleString(
                                    "th-TH"
                                  )}
                                  {pricing.maxOriginalPrice !==
                                    pricing.minOriginalPrice &&
                                    ` - ฿${pricing.maxOriginalPrice.toLocaleString(
                                      "th-TH"
                                    )}`}
                                </span>
                              )}

                              <span className="text-2xl font-bold text-green-400 sm:text-3xl">
                                ฿
                                {pricing.minPrice.toLocaleString(
                                  "th-TH"
                                )}
                                {pricing.hasDifferentNightlyPrices &&
                                  ` - ฿${pricing.maxPrice.toLocaleString(
                                    "th-TH"
                                  )}`}
                              </span>

                              <span className="pb-1 text-xs text-stone-400">
                                / คืน
                              </span>
                            </div>

                            {nights > 1 && (
                              <p className="mt-2 text-xs text-stone-400">
                                รวมค่าห้องพัก {pricing.roomTotal.toLocaleString(
                                  "th-TH"
                                )} บาท / {nights} คืน
                              </p>
                            )}
                          </div>
                        )}

                      {/* UNAVAILABLE MESSAGE */}
                      {!isAvailable && (
                        <div className="mt-5 rounded-2xl border border-stone-700 bg-stone-950/70 p-4">
                          <p className="text-sm text-stone-400">
                            {isBooked
                              ? "ช่วงวันที่เลือกมีการจองแล้ว"
                              : "ช่วงวันที่เลือกปิดรับจอง"}
                          </p>
                        </div>
                      )}

                      {/* ACTIONS */}
                      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <a
                          href={`/rooms/${room.id}`}
                          className="flex min-h-12 items-center justify-center rounded-full border border-stone-600 px-5 py-3 text-sm font-semibold text-stone-200 transition hover:border-stone-400 hover:bg-stone-800"
                        >
                          ดูรายละเอียด
                        </a>

                        {isAvailable ? (
                          <button
                            type="button"
                            onClick={() =>
                              goToRoom(room.id)
                            }
                            className="flex min-h-12 items-center justify-center rounded-full bg-[#3D7A4E] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2B5B39] active:scale-[0.98]"
                          >
                            📅 จองบ้านนี้
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="flex min-h-12 cursor-not-allowed items-center justify-center rounded-full bg-stone-800 px-5 py-3 text-sm font-semibold text-stone-500"
                          >
                            ไม่ว่างในช่วงนี้
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

      {/* ==================================================
          BEFORE SELECTING DATES
      ================================================== */}
      {!loading &&
        !error &&
        (!checkIn || !checkOut) && (
          <div className="mt-7 rounded-2xl border border-stone-700 bg-stone-900/70 p-5 text-center">
            <p className="text-sm leading-7 text-stone-300 sm:text-base">
              เลือกวันเข้าพักและวันออกด้านบน
              <br className="sm:hidden" />
              เพื่อดูว่าบ้านหลังไหนยังว่าง
            </p>
          </div>
        )}

      {/* ==================================================
          FOOTNOTE
      ================================================== */}
      <p className="mt-6 text-center text-xs leading-6 text-stone-500">
        * สถานะวันว่างเป็นข้อมูลล่าสุดจากระบบ
        และระบบจะตรวจสอบวันว่างอีกครั้งก่อนยืนยันการจอง
      </p>
    </section>
  );
}