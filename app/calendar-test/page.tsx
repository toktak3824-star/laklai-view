"use client";

import { useState } from "react";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";

export default function CalendarTestPage() {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  return (
    <main className="min-h-screen bg-stone-950 px-4 py-10 text-white">

      <div className="mx-auto max-w-6xl">

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            ปฏิทินสถานะการจอง
          </h1>

          <p className="mt-2 text-stone-400">
            ทดสอบปฏิทินบ้านสวนวิถี
          </p>

        </div>

        <AvailabilityCalendar
          roomId="house1"
          checkIn={checkIn}
          checkOut={checkOut}
          onCheckInChange={setCheckIn}
          onCheckOutChange={setCheckOut}
        />

        <div className="mt-8 rounded-2xl border border-stone-700 bg-stone-900 p-6">

          <h2 className="mb-4 text-xl font-bold">
            วันที่ที่เลือก
          </h2>

          <div className="grid gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-stone-950 p-4">

              <p className="text-sm text-stone-400">
                วันเข้าพัก
              </p>

              <p className="mt-1 text-lg font-semibold text-emerald-400">
                {checkIn || "ยังไม่ได้เลือก"}
              </p>

            </div>

            <div className="rounded-xl bg-stone-950 p-4">

              <p className="text-sm text-stone-400">
                วันออก
              </p>

              <p className="mt-1 text-lg font-semibold text-emerald-400">
                {checkOut || "ยังไม่ได้เลือก"}
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}