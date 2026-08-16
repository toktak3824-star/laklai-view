import { rooms } from "@/data/rooms";
import Image from "next/image";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function RoomDetailPage({ params }: Props) {
  const { id } = await params;

  const room = rooms.find((r) => r.id === id);

  if (!room) return notFound();

  return (
    <main className="max-w-7xl mx-auto py-20 px-6">
      <h1 className="text-5xl font-bold mb-2">{room.title}</h1>

      <p className="text-xl text-green-700 italic mb-6">
        {room.subtitle}
      </p>

      <p className="text-stone-100 text-xl leading-9 mb-10 font-light">
  {room.description}
</p>

<div className="mb-10 rounded-2xl bg-green-950/40 border border-green-800 p-6">

  <p className="text-sm text-green-300 font-semibold mb-2">
    โปรโมชั่นวันธรรมดา
  </p>

  <div className="flex items-end gap-4">
    <span className="text-2xl text-stone-500 line-through">
      ฿{room.pricing.originalWeekday.toLocaleString()}
    </span>

    <span className="text-5xl font-bold text-green-400">
      ฿{room.pricing.weekday.toLocaleString()}
    </span>
  </div>

  <p className="text-stone-400 mt-6">
    ราคาวันหยุดนักขัตฤกษ์
  </p>

  <div className="flex items-end gap-4 mt-2">
    <span className="text-xl text-stone-500 line-through">
      ฿{room.pricing.originalHoliday.toLocaleString()}
    </span>

    <span className="text-3xl font-bold text-amber-400">
      ฿{room.pricing.holiday.toLocaleString()}
    </span>
  </div>

  <p className="text-xs text-stone-400 mt-6 leading-6">
    ราคาจะเปลี่ยนอัตโนมัติตามวันที่ลูกค้าเลือกเข้าพัก
    ในขั้นตอนการจอง
  </p>

</div>

<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
  {room.images.map((image) => (
    <div
      key={image}
      className="relative aspect-[4/3] overflow-hidden rounded-2xl"
    >
      <Image
        src={image}
        alt={room.title}
        fill
        className="object-cover hover:scale-105 transition duration-300"
      />
    </div>
  ))} 
</div>

<BookingForm room={room} />
        
    </main>
  );
}