import Link from "next/link";
import Image from "next/image";

type RoomCardProps = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  description: string;
  price: number;
  originalPrice: number;
};

export default function RoomCard({
  id,
  title,
  subtitle,
  image,
  description,
  price,
  originalPrice,
}: RoomCardProps) {
  /*
   * ==========================================
   * โปรโมชั่นเดือนกันยายน 2026
   * ==========================================
   *
   * บ้าน 1-3 = 1,699 บาท / คืน
   * บ้าน 4 "บ้านสุขใจ" = 1,499 บาท / คืน
   *
   * หลังเดือนกันยายนจะกลับไปใช้ราคาปกติ
   */

  const now = new Date();

  const isSeptemberPromo =
    now.getFullYear() === 2026 &&
    now.getMonth() === 8;

  /*
   * ==========================================
   * ราคาที่แสดงบน Room Card
   * ==========================================
   */

  const displayPrice = isSeptemberPromo
    ? id === "house4"
      ? 1499
      : 1699
    : price;

  /*
   * ราคาปกติที่ใช้ขีดฆ่า
   *
   * บ้าน 4 บ้านสุขใจ
   * ราคาปกติ = 2,590 บาท
   */

  const displayOriginalPrice = isSeptemberPromo
    ? id === "house4"
      ? 2590
      : originalPrice
    : originalPrice;

  const saving =
    displayOriginalPrice - displayPrice;

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-stone-800 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">

      {/* ==========================================
          Room Image
          ========================================== */}

      <Link
        href={`/rooms/${id}`}
        className="relative block aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10]"
      >
        <Image
          src={image}
          alt={`${title} - Laklai View ที่พักปัว จังหวัดน่าน`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        {/* Image overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

        {/* View badge */}
        <div className="absolute bottom-4 left-4 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          ดูบ้านพัก
        </div>
      </Link>

      {/* ==========================================
          Content
          ========================================== */}

      <div className="p-5 sm:p-7">

        {/* Title */}
        <h3 className="text-2xl font-bold leading-tight text-amber-50 sm:text-3xl">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="mt-1 text-sm italic text-amber-100/70 sm:text-base">
          {subtitle}
        </p>

        {/* Description */}
        <p className="mt-4 text-sm leading-7 text-stone-200 sm:text-base sm:leading-8">
          {description}
        </p>

        {/* ==========================================
            Price
            ========================================== */}

        <div
          className={
            isSeptemberPromo
              ? "mt-5 rounded-2xl border border-green-800/80 bg-green-950/50 p-4 sm:p-5"
              : "mt-5 rounded-2xl border border-white/10 bg-stone-900/40 p-4 sm:p-5"
          }
        >

          {isSeptemberPromo ? (
            <>
              {/* โปรโมชั่น */}
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-300 sm:text-xs">
                🌿 โปรโมชั่นพิเศษ เดือนกันยายน 2026
              </p>

              {/* ราคา */}
              <div className="mt-2 flex items-end gap-3">
                <span className="text-base text-stone-500 line-through sm:text-lg">
                  ฿{displayOriginalPrice.toLocaleString()}
                </span>

                <span className="text-3xl font-bold leading-none text-green-400 sm:text-4xl">
                  ฿{displayPrice.toLocaleString()}
                </span>
              </div>

              {/* ประหยัด */}
              {saving > 0 && (
                <p className="mt-2 text-xs font-semibold text-green-300 sm:text-sm">
                  ประหยัด {saving.toLocaleString()} บาท
                </p>
              )}

              {/* สิทธิพิเศษ */}
              <p className="mt-3 text-sm font-medium leading-6 text-amber-100 sm:text-base">
                🍈 เก็บเงาะทานฟรีได้เลย
              </p>

              <p className="mt-1 text-xs leading-5 text-green-200/80 sm:text-sm">
                เฉพาะการเข้าพักในเดือนกันยายนนี้
              </p>
            </>
          ) : (
            <>
              {/* ราคาปกติ */}
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 sm:text-xs">
                🌿 ราคาพิเศษเมื่อจองผ่านเว็บไซต์หลัก
              </p>

              <div className="mt-2 flex items-end gap-3">
                <span className="text-base text-stone-500 line-through sm:text-lg">
                  ฿{displayOriginalPrice.toLocaleString()}
                </span>

                <span className="text-3xl font-bold leading-none text-green-400 sm:text-4xl">
                  ฿{displayPrice.toLocaleString()}
                </span>
              </div>

              {saving > 0 && (
                <p className="mt-2 text-xs font-semibold text-green-300 sm:text-sm">
                  ประหยัด {saving.toLocaleString()} บาท
                </p>
              )}
            </>
          )}

        </div>

        {/* ==========================================
            Booking conditions
            ========================================== */}

        <div className="mt-4 space-y-1 text-xs leading-6 text-stone-400 sm:text-sm">
          <p>
            ✓ เลื่อนวันเข้าพักได้ฟรี 1 ครั้ง (ตามเงื่อนไขของที่พัก)
          </p>

          <p>
            ✓ หากยกเลิกการจอง ทางที่พักคืนเงิน 50% ของยอดที่ชำระ
          </p>

          <p>
            ✓ สอบถามรายละเอียดเพิ่มเติมผ่าน Facebook Page ของที่พัก
          </p>
        </div>

        {/* ==========================================
            CTA
            ========================================== */}

        <Link
          href={`/rooms/${id}`}
          className="mt-6 flex min-h-12 w-full items-center justify-center rounded-full bg-[#3D7A4E] px-6 py-3.5 text-base font-semibold text-white transition active:scale-[0.98] hover:bg-[#2B5B39] sm:min-h-14 sm:text-lg"
        >
          ดูรายละเอียดบ้านพัก
        </Link>

      </div>
    </article>
  );
}