"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("กรุณากรอก Username และ Password");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "เข้าสู่ระบบไม่สำเร็จ");
      }

      router.replace("/admin/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "เข้าสู่ระบบไม่สำเร็จ"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-950 via-green-900 to-stone-900 px-5">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-[2rem] bg-white p-8 shadow-2xl md:p-10"
      >
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.35em] text-emerald-700">
            LAKLAI VIEW ADMIN
          </p>
          <h1 className="mt-3 text-3xl font-bold text-stone-950">
            เข้าสู่ระบบผู้ดูแล
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            หน้านี้สำหรับเจ้าของและผู้ดูแลระบบเท่านั้น
          </p>
        </div>

        <label className="mb-2 block text-sm font-semibold text-stone-800">
          Username
        </label>
        <input
          autoComplete="username"
          className="mb-5 w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />

        <label className="mb-2 block text-sm font-semibold text-stone-800">
          Password
        </label>
        <input
          type="password"
          autoComplete="current-password"
          className="mb-4 w-full rounded-xl border border-stone-300 bg-white p-3 text-stone-950 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />

        {error && (
          <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-green-800 py-3 font-semibold text-white shadow-sm transition hover:bg-green-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>
    </main>
  );
}
