"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsAdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-stone-100">
      <p className="text-sm font-semibold tracking-[0.35em] text-emerald-700">LAKLAI VIEW ADMIN</p>
      <h1 className="mt-2 text-4xl font-bold text-stone-900">ตั้งค่า</h1>
      <p className="mt-3 text-stone-600">จัดการการเข้าถึงระบบผู้ดูแลและตรวจสอบสถานะความปลอดภัย</p>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <h2 className="text-xl font-bold text-stone-950">🔐 ความปลอดภัย</h2>
          <div className="mt-5 space-y-3 text-sm">

            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
  <span className="font-medium text-stone-800">Authentication</span>
  <strong className="text-emerald-800">เปิดใช้งาน</strong>
</div>

<div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
  <span className="font-medium text-stone-800">Admin API Protection</span>
  <strong className="text-emerald-800">เปิดใช้งาน</strong>
</div>

<div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
  <span className="font-medium text-stone-800">HttpOnly Session Cookie</span>
  <strong className="text-emerald-800">เปิดใช้งาน</strong>
</div>

<div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
  <span className="font-medium text-stone-800">Session อายุ</span>
  <strong className="text-emerald-800">7 วัน</strong>
</div>
</div>
        </section>

        <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-stone-200">
          <h2 className="text-xl font-bold text-stone-950">👤 บัญชีผู้ดูแล</h2>
          <p className="mt-3 leading-7 text-stone-600">ระบบนี้ออกแบบให้มีบัญชีผู้ดูแลหลักเพียงชุดเดียว โดย Username และ Password จะถูกเก็บไว้ใน Environment Variables ไม่เก็บไว้ในหน้าเว็บหรือฐานข้อมูล</p>
          <button type="button" onClick={logout} disabled={loading} className="mt-6 rounded-xl bg-red-700 px-5 py-3 font-semibold text-white hover:bg-red-800 disabled:opacity-50">
            {loading ? "กำลังออกจากระบบ..." : "🚪 ออกจากระบบ"}
          </button>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm leading-7 text-amber-900">
        <strong>หมายเหตุสำคัญก่อนออนไลน์:</strong> ต้องตั้งค่า <code className="rounded bg-amber-100 px-1">ADMIN_USERNAME</code>, <code className="rounded bg-amber-100 px-1">ADMIN_PASSWORD</code> และ <code className="rounded bg-amber-100 px-1">ADMIN_SESSION_SECRET</code> บน Hosting ก่อนจึงจะเข้าสู่หลังบ้านได้
      </section>
    </main>
  );
}
