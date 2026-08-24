"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto border-b border-white/10 bg-black/35 px-4 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          
          {/* Logo */}
          <Link
            href="/"
            onClick={closeMenu}
            className="flex flex-col leading-none text-white"
          >
            <span className="text-[10px] tracking-[0.28em] text-green-300">
              LAKLAI
            </span>
            <span className="mt-1 text-xl font-bold tracking-wide sm:text-2xl">
              หลักลาย View
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden items-center gap-7 md:flex">
            <Link
              href="/"
              className="text-sm font-medium text-white/90 transition hover:text-green-300"
            >
              หน้าแรก
            </Link>

            <Link
              href="/#rooms"
              className="text-sm font-medium text-white/90 transition hover:text-green-300"
            >
              บ้านพัก
            </Link>

            <Link
              href="/coffee"
              className="text-sm font-medium text-white/90 transition hover:text-green-300"
            >
              Coffee Shop
            </Link>

            <Link
              href="/#contact"
              className="text-sm font-medium text-white/90 transition hover:text-green-300"
            >
              ติดต่อเรา
            </Link>

            <Link
              href="/#rooms"
              className="rounded-full bg-green-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-green-700"
            >
              จองที่พัก
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            aria-label={open ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-md md:hidden"
          >
            {open ? (
              <span className="text-2xl leading-none">×</span>
            ) : (
              <span className="flex flex-col gap-1.5">
                <span className="block h-0.5 w-5 bg-white" />
                <span className="block h-0.5 w-5 bg-white" />
                <span className="block h-0.5 w-5 bg-white" />
              </span>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {open && (
          <div className="border-t border-white/10 pb-5 pt-4 md:hidden">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 text-base font-medium text-white transition hover:bg-white/10"
              >
                หน้าแรก
              </Link>

              <Link
                href="/#rooms"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 text-base font-medium text-white transition hover:bg-white/10"
              >
                บ้านพัก
              </Link>

              <Link
                href="/coffee"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 text-base font-medium text-white transition hover:bg-white/10"
              >
                ☕ Coffee Shop
              </Link>

              <Link
                href="/#contact"
                onClick={closeMenu}
                className="rounded-xl px-4 py-3.5 text-base font-medium text-white transition hover:bg-white/10"
              >
                ติดต่อเรา
              </Link>

              <Link
                href="/#rooms"
                onClick={closeMenu}
                className="mt-3 flex min-h-12 items-center justify-center rounded-full bg-green-600 px-6 py-3 text-base font-bold text-white shadow-lg transition hover:bg-green-700"
              >
                จองที่พัก
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}