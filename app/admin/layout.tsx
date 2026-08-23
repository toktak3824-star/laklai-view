"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(pathname !== "/admin/login");

  useEffect(() => {
    if (pathname === "/admin/login") {
    // eslint-disable-next-line react-hooks/set-state-in-effect
      setChecking(false);
      return;
    }

    let active = true;

    fetch("/api/admin/me", { cache: "no-store" })
      .then((response) => {
        if (!response.ok) {
          router.replace(
            `/admin/login?next=${encodeURIComponent(pathname)}`
          );
          return;
        }

        if (active) setChecking(false);
      })
      .catch(() => {
        router.replace(
          `/admin/login?next=${encodeURIComponent(pathname)}`
        );
      });

    return () => {
      active = false;
    };
  }, [pathname, router]);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow-sm">
          <p className="font-semibold text-stone-900">กำลังตรวจสอบสิทธิ์ผู้ดูแล...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="flex min-h-screen bg-stone-100">
      <Sidebar />
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
