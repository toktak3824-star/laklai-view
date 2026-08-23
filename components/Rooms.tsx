import RoomCard from "./RoomCard";
import { rooms } from "../data/rooms";
export default function Rooms() {
  return (
    <section
  id="rooms"
  className="py-20 bg-gradient-to-b from-green-950 via-green-900 to-stone-900"
>
      <div className="max-w-7xl mx-auto px-8">

        <h2 className="text-5xl font-bold text-center mb-4 text-amber-100">
          บ้านพักของเรา
        </h2>

        <p className="text-center text-green-100 text-xl mb-16">
          เลือกบ้านพักที่เหมาะกับช่วงเวลาพักผ่อนของคุณ
        </p>

        <div className="grid md:grid-cols-2 gap-10">

        {rooms.map((room) => (
  <RoomCard
  key={room.id}
  id={room.id}
  title={room.title}
  subtitle={room.subtitle}
  image={room.cover}
  description={room.description}
  price={room.pricing.weekday}
  originalPrice={room.pricing.originalWeekday}
/>
))}

        </div>

      </div>
    </section>
  );
}