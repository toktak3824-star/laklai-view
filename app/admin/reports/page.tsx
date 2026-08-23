"use client";

import { useEffect, useState } from "react";

type Summary = {
  stats: {
    totalBookings: number;
    confirmedBookings: number;
    cancelledBookings: number;
    totalOrders: number;
    bookingRevenue: number;
    coffeeRevenue: number;
    totalRevenue: number;
    todayRevenue: number;
    pendingBookings: number;
    pendingOrders: number;
  };
};

export default function ReportsAdminPage() {
  const [data, setData] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const response = await fetch("/api/admin/summary", { cache: "no-store" });
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error || "โหลดรายงานไม่สำเร็จ");
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "โหลดรายงานไม่สำเร็จ");
    }
  }

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { load(); }, []);

  const s = data?.stats;
  const money = (v: number) => `฿${Number(v || 0).toLocaleString("th-TH")}`;

  return (
    <main className="min-h-screen bg-stone-100">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold tracking-[0.35em] text-emerald-700">LAKLAI VIEW ADMIN</p>
          <h1 className="mt-2 text-4xl font-bold text-stone-900">รายได้</h1>
          <p className="mt-3 text-stone-600">สรุปรายได้จากที่พักและกาแฟจากรายการที่ชำระเงินแล้ว</p>
        </div>
        <button onClick={load} className="rounded-xl bg-green-800 px-5 py-3 font-semibold text-white hover:bg-green-900">รีเฟรช</button>
      </div>

      {error && <div className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">{error}</div>}

      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200"><p className="text-sm text-stone-500">รายได้รวม</p><p className="mt-2 text-3xl font-bold text-green-700">{money(s?.totalRevenue ?? 0)}</p></div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200"><p className="text-sm text-stone-500">ที่พัก</p><p className="mt-2 text-3xl font-bold text-stone-900">{money(s?.bookingRevenue ?? 0)}</p><p className="mt-1 text-sm text-stone-500">ยืนยันแล้ว {s?.confirmedBookings ?? 0} รายการ</p></div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200"><p className="text-sm text-stone-500">กาแฟ</p><p className="mt-2 text-3xl font-bold text-stone-900">{money(s?.coffeeRevenue ?? 0)}</p><p className="mt-1 text-sm text-stone-500">ออเดอร์ทั้งหมด {s?.totalOrders ?? 0}</p></div>
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200"><p className="text-sm text-stone-500">รายได้วันนี้</p><p className="mt-2 text-3xl font-bold text-emerald-800">{money(s?.todayRevenue ?? 0)}</p></div>
      </div>

      <section className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
        <h2 className="text-xl font-bold text-stone-950">สถานะระบบการเงิน</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="rounded-xl bg-amber-50 p-4"><p className="text-sm text-amber-800">รอการจอง</p><p className="mt-1 text-2xl font-bold text-amber-900">{s?.pendingBookings ?? 0}</p></div>
          <div className="rounded-xl bg-yellow-50 p-4"><p className="text-sm text-yellow-800">รอออเดอร์กาแฟ</p><p className="mt-1 text-2xl font-bold text-yellow-900">{s?.pendingOrders ?? 0}</p></div>
          <div className="rounded-xl bg-emerald-50 p-4"><p className="text-sm text-emerald-800">การจองทั้งหมด</p><p className="mt-1 text-2xl font-bold text-emerald-900">{s?.totalBookings ?? 0}</p></div>
          <div className="rounded-xl bg-red-50 p-4"><p className="text-sm text-red-800">ยกเลิกแล้ว</p><p className="mt-1 text-2xl font-bold text-red-900">{s?.cancelledBookings ?? 0}</p></div>
        </div>
      </section>
    </main>
  );
}
