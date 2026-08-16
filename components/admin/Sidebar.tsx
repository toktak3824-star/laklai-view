"use client";

import Link from "next/link";

const menus = [
  { name: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
  { name: "การจอง", href: "/admin/bookings", icon: "📅" },
  { name: "บ้านพัก", href: "/admin/rooms", icon: "🏡" },
  { name: "ปฏิทิน", href: "/admin/calendar", icon: "🗓️" },
  { name: "รายได้", href: "/admin/reports", icon: "💰" },
  { name: "รีวิว", href: "/admin/reviews", icon: "⭐" },
  { name: "ตั้งค่า", href: "/admin/settings", icon: "⚙️" },
];

export default function Sidebar() {
  return (
    <aside className="w-72 bg-green-950 text-white min-h-screen p-6">

      <h1 className="text-3xl font-bold mb-10">
        Laklai View
      </h1>

      <nav className="space-y-2">

        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-green-800"
          >
            <span>{menu.icon}</span>

            <span className="text-stone-100">
              {menu.name}
            </span>
          </Link>
        ))}

      </nav>

    </aside>
  );
}