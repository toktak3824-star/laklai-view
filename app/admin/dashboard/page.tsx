"use client";

import { useEffect, useState } from "react";
import BookingTable from "@/components/admin/BookingTable";

type Summary = {
  today: string;
  stats: {
    todayCheckIns: number;
    todayCheckOuts: number;
    pendingBookings: number;
    pendingOrders: number;
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    totalOrders: number;
    bookingRevenue: number;
    coffeeRevenue: number;
    totalRevenue: number;
    todayRevenue: number;
  };
};

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  async function loadSummary() {
    try {
      setError("");
      const response = await fetch("/api/admin/summary", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "โหลด Dashboard ไม่สำเร็จ");
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลด Dashboard ไม่สำเร็จ");
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSummary();
    const interval = window.setInterval(loadSummary, 30000);
    return () => window.clearInterval(interval);
  }, []);

  const stats = summary?.stats;
  const money = (value: number) => `฿${Number(value || 0).toLocaleString("th-TH")}`;

  return (
    <main className="min-h-screen bg-stone-100">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.35em] text-emerald-800">LAKLAI VIEW ADMIN</p>
          <h1 className="mt-2 text-4xl font-bold text-stone-950">Dashboard</h1>
          <p className="mt-2 text-stone-600">ภาพรวมการจอง ที่พัก กาแฟ และรายได้จากข้อมูลจริง</p>
        </div>
        <button onClick={loadSummary} className="rounded-xl bg-green-800 px-5 py-3 font-semibold text-white hover:bg-green-900">รีเฟรชข้อมูล</button>
      </div>

      {error && <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["เช็กอินวันนี้", stats?.todayCheckIns ?? 0, "รายการ"],
          ["เช็กเอาท์วันนี้", stats?.todayCheckOuts ?? 0, "รายการ"],
          ["รอการจัดการ", (stats?.pendingBookings ?? 0) + (stats?.pendingOrders ?? 0), "จอง + ออเดอร์"],
          ["รายได้วันนี้", money(stats?.todayRevenue ?? 0), "ที่พัก + กาแฟ"],
        ].map(([label, value, sub]) => (
          <div key={String(label)} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
            <p className="text-sm font-medium text-stone-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-stone-950">{value}</p>
            <p className="mt-1 text-sm text-stone-500">{sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">รายได้ที่พักสะสม</p>
          <p className="mt-2 text-3xl font-bold text-emerald-800">{money(stats?.bookingRevenue ?? 0)}</p>
          <p className="mt-2 text-sm text-stone-500">ยืนยันและชำระแล้ว {stats?.confirmedBookings ?? 0} รายการ</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">รายได้กาแฟสะสม</p>
          <p className="mt-2 text-3xl font-bold text-emerald-800">{money(stats?.coffeeRevenue ?? 0)}</p>
          <p className="mt-2 text-sm text-stone-500">ชำระแล้ว {stats?.totalOrders ?? 0} ออเดอร์ทั้งหมด</p>
        </div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">รายได้รวม</p>
          <p className="mt-2 text-3xl font-bold text-green-700">{money(stats?.totalRevenue ?? 0)}</p>
          <p className="mt-2 text-sm text-stone-500">ยกเลิกการจอง {stats?.cancelledBookings ?? 0} รายการ</p>
        </div>
      </div>

      <BookingTable />
    </main>
  );
}
