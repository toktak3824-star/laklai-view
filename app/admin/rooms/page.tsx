import Link from "next/link";
import Image from "next/image";
import { rooms } from "@/data/rooms";

export default function RoomsAdminPage() {
  return (
    <main className="min-h-screen bg-stone-100">
      <p className="text-sm font-semibold tracking-[0.35em] text-emerald-700">LAKLAI VIEW ADMIN</p>
      <h1 className="mt-2 text-4xl font-bold text-stone-900">บ้านพัก</h1>
      <p className="mt-3 text-stone-600">ตรวจสอบข้อมูลบ้านพัก ราคา จำนวนผู้เข้าพัก และไปจัดการปฏิทินของแต่ละหลัง</p>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        {rooms.map((room) => (
          <article key={room.id} className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
            <div className="grid md:grid-cols-[220px_1fr]">
              <div className="relative min-h-56 bg-stone-200">
                <Image src={room.cover} alt={room.title} fill className="object-cover" sizes="220px" />
              </div>
              <div className="p-6">
                <p className="text-xs font-semibold tracking-[0.25em] text-emerald-700">{room.id.toUpperCase()}</p>
                <h2 className="mt-1 text-2xl font-bold text-stone-950">{room.title}</h2>
                <p className="mt-1 text-sm text-stone-500">{room.subtitle}</p>
                <p className="mt-4 text-sm leading-6 text-stone-700">{room.description}</p>

                <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl bg-stone-100 p-3"><span className="text-stone-500">ราคาวันธรรมดา</span><div className="font-bold text-stone-900">฿{room.pricing.weekday.toLocaleString()}</div></div>
                  <div className="rounded-xl bg-stone-100 p-3"><span className="text-stone-500">ราคาวันหยุด</span><div className="font-bold text-stone-900">฿{room.pricing.holiday.toLocaleString()}</div></div>
                  <div className="rounded-xl bg-stone-100 p-3"><span className="text-stone-500">ผู้เข้าพักปกติ</span><div className="font-bold text-stone-900">{room.defaultGuests} คน</div></div>
                  <div className="rounded-xl bg-stone-100 p-3"><span className="text-stone-500">สูงสุด</span><div className="font-bold text-stone-900">{room.maxGuests} คน</div></div>
                </div>

                <Link href="/admin/calendar" className="mt-5 inline-flex rounded-xl bg-green-800 px-4 py-3 font-semibold text-white hover:bg-green-900">
                  🗓️ จัดการปฏิทินบ้านนี้
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
