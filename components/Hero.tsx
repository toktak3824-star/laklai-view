import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Image */}
      <div className="relative h-[72svh] min-h-[500px] w-full sm:h-[75vh] sm:min-h-[560px]">
        <Image
          src="/images/hero/hero.jpg"
          alt="หลักลาย View ที่พักสุดเขตปัว จังหวัดน่าน วิวภูเขาท่ามกลางธรรมชาติ"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[center_48%] sm:object-center"
        />

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/35" />

        {/* Soft bottom gradient */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center justify-center px-5 pt-16 sm:px-6 sm:pt-20">
          <div className="w-full max-w-3xl text-center text-white">
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.35em] text-green-200 sm:text-sm">
              LAKLAI VIEW • NAN
            </p>

            <h1 className="text-4xl font-bold leading-tight tracking-tight drop-shadow-lg sm:text-6xl lg:text-7xl">
              หลักลาย View
            </h1>

            <p className="mt-5 text-xl font-medium drop-shadow-md sm:text-2xl">
              หลีกหนีความวุ่นวาย
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-white/90 sm:text-lg">
              กลับมาใช้เวลาช้าๆ ในท่ามกลางธรรมชาติอีกครั้ง
            </p>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 flex-col items-center text-white/70 sm:flex">
          <span className="mb-2 text-[10px] tracking-[0.25em]">
            EXPLORE
          </span>
          <span className="h-8 w-px bg-white/50" />
        </div>
      </div>

      {/* Main CTA */}
      <div className="bg-[#1f4d38] px-5 py-5 sm:px-6 sm:py-7">
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:justify-center sm:gap-4">
          <Link
            href="#rooms"
            className="flex min-h-14 w-full items-center justify-center rounded-full bg-green-600 px-7 py-4 text-base font-bold text-white shadow-lg shadow-black/20 transition active:scale-[0.98] hover:bg-green-500 sm:w-auto sm:min-w-[210px] sm:text-lg"
          >
            จองที่พัก
          </Link>

          <Link
            href="/coffee"
            className="flex min-h-14 w-full items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-4 text-base font-semibold text-white backdrop-blur-md transition active:scale-[0.98] hover:bg-white/20 sm:w-auto sm:min-w-[210px] sm:text-lg"
          >
            ☕ Coffee Shop
          </Link>
        </div>
      </div>
    </section>
  );
}