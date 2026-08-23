"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

type Booking = { id: string; created_at?: string };
type CoffeeOrder = { id: string; created_at?: string };

const menus = [
  { name: "Dashboard", href: "/admin/dashboard", icon: "🏠", key: "dashboard" },
  { name: "การจอง", href: "/admin/bookings", icon: "📅", key: "bookings" },
  { name: "รายการสั่งซื้อ", href: "/admin/orders", icon: "☕", key: "orders" },
  { name: "บ้านพัก", href: "/admin/rooms", icon: "🏡", key: "rooms" },
  { name: "ปฏิทิน", href: "/admin/calendar", icon: "🗓️", key: "calendar" },
  { name: "รายได้", href: "/admin/reports", icon: "💰", key: "reports" },
  { name: "รีวิว", href: "/admin/reviews", icon: "⭐", key: "reviews" },
  { name: "ตั้งค่า", href: "/admin/settings", icon: "⚙️", key: "settings" },
];

const STORAGE_KEYS = {
  bookings: "laklai_admin_bookings_last_read",
  orders: "laklai_admin_orders_last_read",
};

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [bookingUnread, setBookingUnread] = useState(0);
  const [orderUnread, setOrderUnread] = useState(0);

  async function loadNotifications() {
    try {
      const [bookingResponse, orderResponse] = await Promise.all([
        fetch("/api/admin/bookings", { cache: "no-store" }),
        fetch("/api/coffee-orders", { cache: "no-store" }),
      ]);

      if (!bookingResponse.ok || !orderResponse.ok) return;

      const bookingsData = await bookingResponse.json();
      const ordersData = await orderResponse.json();
      const bookings: Booking[] = Array.isArray(bookingsData)
        ? bookingsData
        : bookingsData.bookings ?? [];
      const orders: CoffeeOrder[] = Array.isArray(ordersData)
        ? ordersData
        : ordersData.orders ?? [];

      const bookingLastRead = Number(localStorage.getItem(STORAGE_KEYS.bookings) || 0);
      const orderLastRead = Number(localStorage.getItem(STORAGE_KEYS.orders) || 0);

      setBookingUnread(
        bookings.filter(
          (item) => item.created_at && new Date(item.created_at).getTime() > bookingLastRead
        ).length
      );
      setOrderUnread(
        orders.filter(
          (item) => item.created_at && new Date(item.created_at).getTime() > orderLastRead
        ).length
      );
    } catch (error) {
      console.error("ADMIN NOTIFICATION ERROR =", error);
    }
  }

  function markAsRead(key: "bookings" | "orders") {
    localStorage.setItem(STORAGE_KEYS[key], String(Date.now()));
    if (key === "bookings") setBookingUnread(0);
    if (key === "orders") setOrderUnread(0);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (pathname === "/admin/bookings") markAsRead("bookings");
    if (pathname === "/admin/orders") markAsRead("orders");
  }, [pathname]);

  return (
    <aside className="sticky top-0 flex h-screen w-72 shrink-0 flex-col bg-green-950 p-6 text-white">
      <div>
        <h1 className="mb-1 text-3xl font-bold">Laklai View</h1>
        <p className="mb-10 text-xs tracking-[0.3em] text-emerald-300">ADMIN</p>

        <nav className="space-y-2">
          {menus.map((menu) => {
            const unread = menu.key === "bookings" ? bookingUnread : menu.key === "orders" ? orderUnread : 0;
            const active = pathname === menu.href || pathname.startsWith(`${menu.href}/`);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={() => {
                  if (menu.key === "bookings" || menu.key === "orders") {
                    markAsRead(menu.key);
                  }
                }}
                className={`flex items-center justify-between rounded-xl px-4 py-3 transition ${
                  active ? "bg-green-800" : "hover:bg-green-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{menu.icon}</span>
                  <span className="font-medium text-white">{menu.name}</span>
                </div>
                {unread > 0 && (
                  <span className="flex min-h-6 min-w-6 items-center justify-center rounded-full bg-red-600 px-2 text-xs font-bold text-white">
                    {unread > 99 ? "99+" : unread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-auto rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-left font-semibold text-white transition hover:bg-white/10"
      >
        🚪 ออกจากระบบ
      </button>
    </aside>
  );
}
