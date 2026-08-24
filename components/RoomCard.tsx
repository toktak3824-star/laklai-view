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
  const saving = originalPrice - price;

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-stone-800 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">
      
      {/* Room Image */}
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

      {/* Content */}
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

        {/* Price */}
        <div className="mt-5 rounded-2xl border border-green-800/80 bg-green-950/50 p-4 sm:p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-green-300 sm:text-xs">
            🌿 ราคาพิเศษเมื่อจองผ่านเว็บไซต์หลัก
          </p>

          <div className="mt-2 flex items-end gap-3">
            <span className="text-base text-stone-500 line-through sm:text-lg">
              ฿{originalPrice.toLocaleString()}
            </span>

            <span className="text-3xl font-bold leading-none text-green-400 sm:text-4xl">
              ฿{price.toLocaleString()}
            </span>
          </div>

          {saving > 0 && (
            <p className="mt-2 text-xs font-semibold text-green-300 sm:text-sm">
              ประหยัด {saving.toLocaleString()} บาท
            </p>
          )}
        </div>

        {/* Booking conditions */}
        <div className="mt-4 space-y-1 text-xs leading-6 text-stone-400 sm:text-sm">
          <p>✓ เลื่อนวันเข้าพักได้ฟรี 1 ครั้ง (ตามเงื่อนไขของที่พัก)</p>
          <p>✓ หากยกเลิกการจอง ทางที่พักคืนเงิน 50% ของยอดที่ชำระ</p>
          <p>✓ สอบถามรายละเอียดเพิ่มเติมผ่าน Facebook Page ของที่พัก</p>
        </div>

        {/* CTA */}
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