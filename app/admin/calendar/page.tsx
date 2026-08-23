"use client";

import { useState } from "react";
import AvailabilityCalendar from "@/components/AvailabilityCalendar";
import { rooms } from "@/data/rooms";

export default function CalendarAdminPage() {
  const [selectedRoom, setSelectedRoom] = useState(rooms[0].id);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const room = rooms.find((item) => item.id === selectedRoom) ?? rooms[0];

  return (
    <main className="min-h-screen bg-stone-100">
      <p className="text-sm font-semibold tracking-[0.35em] text-emerald-700">LAKLAI VIEW ADMIN</p>
      <h1 className="mt-2 text-4xl font-bold text-stone-900">ปฏิทิน</h1>
      <p className="mt-3 text-stone-600">ดูวันจองและเปิด/ปิดรับจองของบ้านพักแต่ละหลังได้จากหน้านี้</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <section className="h-fit rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200">
          <h2 className="text-lg font-bold text-stone-950">เลือกบ้านพัก</h2>
          <div className="mt-4 space-y-2">
            {rooms.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedRoom(item.id)}
                className={`w-full rounded-xl px-4 py-3 text-left font-semibold transition ${selectedRoom === item.id ? "bg-green-800 text-white" : "bg-stone-100 text-stone-800 hover:bg-stone-200"}`}
              >
                {item.title}
              </button>
            ))}
          </div>
          <div className="mt-5 rounded-xl bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
            <strong>{room.title}</strong>
            <br />
            คลิกวันที่ว่างเพื่อปิดรับจอง หรือคลิกวันที่ปิดรับจองเพื่อเปิดกลับมาอีกครั้ง
          </div>
        </section>

        <AvailabilityCalendar
          key={selectedRoom}
          roomId={selectedRoom}
          admin
          checkIn={checkIn}
          checkOut={checkOut}
          onCheckInChange={setCheckIn}
          onCheckOutChange={setCheckOut}
        />
      </div>
    </main>
  );
}
