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
  return (
    <div className="bg-stone-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl duration-300">

      <div className="relative h-72">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-8">

        <h3 className="text-3xl font-bold text-amber-50">
          {title}
        </h3>

        <p className="text-amber-50 mb-4 italic">
          {subtitle}
        </p>
        <div className="mt-6 rounded-2xl bg-green-950/40 border border-green-800 p-5">

  <p className="text-xs uppercase tracking-[0.25em] text-green-300 font-semibold">
  🌿 ราคาพิเศษเมื่อจองผ่านเว็บไซต์หลัก
</p>

  <div className="flex items-end gap-3 mt-2">

    <span className="text-lg text-stone-500 line-through">
      ฿{originalPrice.toLocaleString()}
    </span>

    <span className="text-4xl font-bold text-green-400">
      ฿{price.toLocaleString()}
    </span>

  </div>
<p className="text-green-100 leading-8">
  {description}
</p>

<p className="text-sm text-green-300 mt-2 font-semibold">
  ประหยัด {originalPrice - price} บาท
</p>

  <p className="text-xs text-stone-400 mt-3 leading-6">
✓ เลื่อนวันเข้าพักได้ฟรี 1 ครั้ง (ตามเงื่อนไขของที่พัก)
<br />
✓ หากยกเลิกการจอง ทางที่พักคืนเงิน 50% ของยอดที่ชำระ
<br />
✓ สอบถามรายละเอียดเพิ่มเติมผ่าน Facebook Page ของที่พัก
</p>

</div>

      <Link
  href={`/rooms/${id}`}
  className="inline-block mt-8 bg-[#3D7A4E] hover:bg-[#2B5B39] text-white px-8 py-3 rounded-full transition duration-300"
>
  ดูรายละเอียด
</Link>

      </div>

    </div>
  );
}