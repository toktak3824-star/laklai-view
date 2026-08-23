import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative">
      {/* Hero Image */}
      <div className="relative h-[75vh] min-h-[560px]">
        <Image
          src="/images/hero/hero.jpg"
          alt="Laklai View"
          fill
          className="object-cover"
          priority
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-6">
            <h1 className="text-5xl font-bold sm:text-6xl lg:text-7xl">
              หลักลาย View
            </h1>

            <p className="mt-6 text-xl sm:text-2xl">
              หลีกหนีความวุ่นวาย
            </p>

            <p className="text-base sm:text-lg">
              กลับมาใช้เวลาในธรรมชาติอีกครั้ง
            </p>
          </div>
        </div>
      </div>

      {/* Hero Buttons */}
      <div className="flex flex-col items-center justify-center gap-4 bg-[#1f4d38] px-6 py-7 sm:flex-row">
        <a
          href="#rooms"
          className="inline-flex min-w-[190px] items-center justify-center rounded-full bg-green-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-green-700"
        >
          จองที่พัก
        </a>

        <Link
          href="/coffee"
          className="inline-flex min-w-[190px] items-center justify-center rounded-full border border-white/40 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          ☕ Coffee Shop
        </Link>
      </div>
    </section>
  );
}