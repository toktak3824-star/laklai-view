import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#101914] text-stone-200">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">

        <div className="grid gap-10 md:grid-cols-3">

          {/* Brand */}
          <div>
            <p className="text-xs tracking-[0.35em] text-green-400">
              LAKLAI VIEW
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              หลักลาย View
            </h2>

            <p className="mt-4 max-w-sm text-sm leading-7 text-stone-400">
              บ้านพักท่ามกลางธรรมชาติและวิวภูเขา
              สุดเขตอำเภอปัว ใกล้ถนนเลข 3 จังหวัดน่าน
              สำหรับคนที่อยากหยุดพักจากความวุ่นวาย
              และกลับมาใช้เวลาช้าๆ ในธรรมชาติอีกครั้ง
            </p>
          </div>

          {/* Menu */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              เมนู
            </h3>

            <div className="mt-4 flex flex-col gap-3 text-sm">

              <Link
                href="/"
                className="transition hover:text-green-400"
              >
                หน้าแรก
              </Link>

              <Link
                href="/#rooms"
                className="transition hover:text-green-400"
              >
                บ้านพัก
              </Link>

              <Link
                href="/coffee"
                className="transition hover:text-green-400"
              >
                ☕ Coffee Shop
              </Link>

              <Link
                href="/contact"
                className="transition hover:text-green-400"
              >
                ติดต่อเรา
              </Link>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white">
              ติดต่อเรา
            </h3>

            <div className="mt-4 space-y-3 text-sm text-stone-400">

              <p>
                📍 สุดเขตอำเภอปัว จังหวัดน่าน
              </p>

              <p>
                🛣️ ใกล้ถนนเลข 3 ประมาณ 4.5 กม.
              </p>

              <p>
                🏔️ เส้นทางมุ่งหน้าสู่บ่อเกลือ และสะปัน
              </p>

            </div>

            <Link
              href="/contact"
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              ช่องทางการติดต่อ
            </Link>
          </div>

        </div>

        {/* Bottom */}
        <div className="mt-12 border-t border-white/10 pt-6 text-center">

          <p className="text-sm text-stone-500">
            © {new Date().getFullYear()} Laklai View. All rights reserved.
          </p>

          <p className="mt-2 text-xs tracking-[0.2em] text-green-500">
            หลักลายวิว LAKLAI VIEW
          </p>

        </div>

      </div>
    </footer>
  );
}