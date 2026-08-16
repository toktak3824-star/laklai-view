"use client";

import { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-950 to-stone-900">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <h1 className="mb-8 text-center text-3xl font-bold">
          Laklai View Admin
        </h1>

        <input
          className="mb-4 w-full rounded-xl border p-3"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          className="mb-6 w-full rounded-xl border p-3"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="w-full rounded-xl bg-green-700 py-3 font-semibold text-white hover:bg-green-800"
        >
          Login
        </button>

      </div>

    </main>
  );
}