import RoomCard from "./RoomCard";
import AllRoomsAvailability from "./AllRoomsAvailability";
import { rooms } from "../data/rooms";

export default function Rooms() {
  return (
    <section
      id="rooms"
      className="scroll-mt-16 bg-gradient-to-b from-green-950 via-green-900 to-stone-900 py-14 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ==================================================
            HEADER
        ================================================== */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-green-300 sm:text-sm">
            LAKLAI VIEW
          </p>

          <h2 className="text-3xl font-bold leading-tight text-amber-100 sm:text-4xl lg:text-5xl">
            บ้านพักของเรา
          </h2>

          <p className="mt-4 text-sm leading-7 text-green-100/90 sm:text-lg sm:leading-8">
            เลือกบ้านพักที่เหมาะกับช่วงเวลาพักผ่อนของคุณ
          </p>

          {/* ==================================================
              QUICK AVAILABILITY BUTTON
          ================================================== */}
          <a
            href="#all-rooms-availability"
            className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full border border-green-300/40 bg-green-800/70 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-green-700 active:scale-[0.98] sm:min-h-14 sm:px-8 sm:text-base"
          >
            📅 เช็กวันว่างของบ้านพักทั้งหมด
          </a>
        </div>

        {/* ==================================================
            ROOM CARDS
        ================================================== */}
        <div className="grid grid-cols-1 gap-7 sm:gap-8 md:grid-cols-2 lg:gap-10">
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

        {/* ==================================================
            ALL ROOMS AVAILABILITY
        ================================================== */}
        <AllRoomsAvailability />
      </div>
    </section>
  );
}