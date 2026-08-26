import type { Metadata } from "next";
import { rooms } from "@/data/rooms";
import Image from "next/image";
import { notFound } from "next/navigation";
import BookingForm from "@/components/BookingForm";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

const BASE_URL = "https://laklaiview.com";

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;

  const room = rooms.find((r) => r.id === id);

  if (!room) {
    return {
      title: "ไม่พบห้องพัก | Laklai View",
    };
  }

  const title = `${room.title} | Laklai View ที่พักปัว จังหวัดน่าน`;

  const description =
    `${room.description} ` +
    `ที่พักส่วนตัวท่ามกลางธรรมชาติ วิวภูเขา ใกล้ถนนเลข 3 ` +
    `เดินทางต่อไปบ่อเกลือ จังหวัดน่านได้สะดวก`;

  return {
    title,
    description,

    keywords: [
      room.title,
      "Laklai View",
      "หลักลาย View",
      "ที่พักปัว",
      "ที่พักจังหวัดน่าน",
      "ที่พักบ่อเกลือ",
      "ที่พักใกล้ถนนเลข 3",
      "บ้านพักวิวภูเขา",
      "ที่พักธรรมชาติ",
    ],

    alternates: {
      canonical: `${BASE_URL}/rooms/${room.id}`,
    },

    openGraph: {
      title,
      description,
      url: `${BASE_URL}/rooms/${room.id}`,
      siteName: "Laklai View",
      locale: "th_TH",
      type: "website",

      images: room.images?.[0]
        ? [
            {
              url: room.images[0],
              width: 1200,
              height: 800,
              alt: room.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: room.images?.[0] ? [room.images[0]] : undefined,
    },

    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RoomDetailPage({ params }: Props) {
  const { id } = await params;

  const room = rooms.find((r) => r.id === id);

  if (!room) return notFound();

  const roomSchema = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.title,
    description: room.description,
    url: `${BASE_URL}/rooms/${room.id}`,

    image: room.images.map((image) =>
      image.startsWith("http") ? image : `${BASE_URL}${image}`
    ),

    containedInPlace: {
      "@type": "LodgingBusiness",
      name: "Laklai View",
      url: BASE_URL,

      address: {
        "@type": "PostalAddress",
        addressLocality: "ปัว",
        addressRegion: "น่าน",
        addressCountry: "TH",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(roomSchema),
        }}
      />

      <main className="mx-auto max-w-7xl px-6 py-20">

        {/* =========================
            ROOM HEADER
        ========================== */}

        <h1 className="mb-2 text-5xl font-bold">
          {room.title}
        </h1>

        <p className="mb-6 text-xl italic text-green-700">
          {room.subtitle}
        </p>

        <p className="mb-10 text-xl font-light leading-9 text-stone-100">
          {room.description}
        </p>


        {/* =========================
            PRICE
        ========================== */}

        <div className="mb-10 rounded-2xl border border-green-800 bg-green-950/40 p-6">

          <p className="mb-2 text-sm font-semibold text-green-300">
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


          <p className="mt-6 text-stone-400">
            ราคาวันหยุดนักขัตฤกษ์
          </p>

          <div className="mt-2 flex items-end gap-4">

            <span className="text-xl text-stone-500 line-through">
              ฿{room.pricing.originalHoliday.toLocaleString()}
            </span>

            <span className="text-3xl font-bold text-amber-400">
              ฿{room.pricing.holiday.toLocaleString()}
            </span>

          </div>


          <p className="mt-6 text-xs leading-6 text-stone-400">
            ราคาจะเปลี่ยนอัตโนมัติตามวันที่ลูกค้าเลือกเข้าพัก
            ในขั้นตอนการจอง
          </p>

        </div>


        {/* =========================
            PHOTO GALLERY
        ========================== */}

        <section className="mb-14">

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              LAKLAI VIEW
            </p>

            <h2 className="text-3xl font-bold text-amber-50 sm:text-4xl">
              บรรยากาศบ้านพัก
            </h2>

            <p className="mt-3 text-stone-400">
              ชมบรรยากาศ ห้องพัก และมุมต่าง ๆ ภายในบ้าน
            </p>
          </div>


          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

            {room.images.map((image) => (
              <div
                key={image}
                className="relative aspect-[4/3] overflow-hidden rounded-2xl"
              >

                <Image
                  src={image}
                  alt={`${room.title} - Laklai View ที่พักปัว น่าน`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover transition duration-300 hover:scale-105"
                />

              </div>
            ))}

          </div>

        </section>


        {/* =========================
            VIDEO GALLERY
        ========================== */}

        {room.videos && room.videos.length > 0 && (
          <section className="mb-14">

            <div className="mb-8">

              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
                EXPERIENCE LAKLAI
              </p>

              <h2 className="text-3xl font-bold text-amber-50 sm:text-4xl">
                ชมบรรยากาศผ่านวิดีโอ
              </h2>

              <p className="mt-3 text-stone-400">
                สัมผัสบรรยากาศของบ้านพักและธรรมชาติของหลักลาย View
              </p>

            </div>


            <div className="grid gap-8 md:grid-cols-2">

              {room.videos.map((video) => (
                <div
                  key={video}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-black/30 shadow-xl"
                >

                  <video
                    controls
                    playsInline
                    preload="metadata"
                    poster={room.images?.[0]}
                    className="h-auto w-full object-cover"
                  >
                    <source
                      src={video}
                      type="video/mp4"
                    />

                    เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                  </video>

                </div>
              ))}

            </div>

          </section>
        )}


                {/* =========================
            FACILITIES & BENEFITS
        ========================== */}

        <section className="mb-16">

          {/* Section Heading */}
          <div className="mb-10 text-center">

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-green-400">
              LAKLAI VIEW EXPERIENCE
            </p>

            <h2 className="text-3xl font-bold text-amber-50 sm:text-4xl lg:text-5xl">
              สิ่งอำนวยความสะดวกและสิทธิพิเศษ
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-300 sm:text-base sm:leading-8">
              เพราะการพักผ่อนที่ดี ไม่ได้มีเพียงบ้านพัก
              แต่คือรายละเอียดเล็ก ๆ ที่เราเตรียมไว้ให้คุณตลอดการเข้าพัก
            </p>

          </div>


          {/* =========================
              SPECIAL BENEFITS
          ========================== */}

          <div className="mb-10 grid gap-5 md:grid-cols-3">

            {/* Breakfast */}
            <div className="rounded-3xl border border-amber-200/10 bg-gradient-to-br from-amber-50/10 to-green-950/50 p-6 shadow-lg">

              <div className="mb-4 text-4xl">
                🍳
              </div>

              <h3 className="text-xl font-bold text-amber-50">
                อาหารเช้า
              </h3>

              <p className="mt-2 text-sm leading-7 text-stone-300">
                ที่พักพร้อมอาหารเช้า Breakfast
                ที่คุ้มค่า เติมพลังให้พร้อมออกไปสัมผัสธรรมชาติของน่าน
              </p>

            </div>


            {/* Welcome Drink */}
            <div className="rounded-3xl border border-amber-200/10 bg-gradient-to-br from-amber-50/10 to-green-950/50 p-6 shadow-lg">

              <div className="mb-4 text-4xl">
                🌼🫖
              </div>

              <h3 className="text-xl font-bold text-amber-50">
                Welcome Drink
              </h3>

              <p className="mt-2 text-sm leading-7 text-stone-300">
                เวลคั่มดริ้งค์ชาดอกเก๊กฮวย
                สำหรับช่วงเช้าหรือช่วงบ่าย
                ผลิตภัณฑ์หลักลาย View
              </p>

            </div>


            {/* Drip Coffee */}
            <div className="rounded-3xl border border-amber-200/10 bg-gradient-to-br from-amber-50/10 to-green-950/50 p-6 shadow-lg">

              <div className="mb-4 text-4xl">
                ☕️
              </div>

              <h3 className="text-xl font-bold text-amber-50">
                ชุดดริปกาแฟ
              </h3>

              <p className="mt-2 text-sm leading-7 text-stone-300">
                นำเสนอด้วยกาแฟคุณภาพดีของเมืองน่าน
                พร้อมรสชาติที่เป็นเอกลักษณ์เฉพาะของหลักลาย View
              </p>

            </div>

          </div>


          {/* =========================
              PRIVATE MINERAL POOL
              HOUSE 1-3 ONLY
          ========================== */}

          {room.id !== "house4" && (
            <div className="mb-10 overflow-hidden rounded-3xl border border-green-700/40 bg-gradient-to-r from-green-950/80 via-green-900/50 to-stone-900/80 p-6 shadow-xl sm:p-8">

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-green-500/10 text-5xl">
                  🌳🏊‍♂️
                </div>

                <div>

                  <h3 className="text-2xl font-bold text-green-300 sm:text-3xl">
                    สระน้ำแร่ธรรมชาติส่วนตัว
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-stone-200 sm:text-base sm:leading-8">
                    สระน้ำขนาดเล็กแบบส่วนตัว
                    น้ำแร่ธรรมชาติจากน้ำประปาภูเขา
                    ให้คุณได้แช่น้ำและพักผ่อนท่ามกลางธรรมชาติ
                  </p>

                  <p className="mt-3 text-xs font-medium text-amber-200 sm:text-sm">
                    🩱 กรุณาสวมชุดว่ายน้ำเมื่อใช้บริการสระน้ำ ห้ามนำสิ่งปฏิกูลลงในสระน้ำ
                  </p>

                </div>

              </div>

            </div>
          )}


          {/* =========================
              AMENITIES
          ========================== */}

          <div className="rounded-3xl border border-white/10 bg-stone-900/60 p-6 shadow-xl sm:p-8">

            <div className="mb-8">

              <p className="mb-2 text-sm font-semibold uppercase tracking-[0.25em] text-green-400">
                AMENITIES
              </p>

              <h3 className="text-2xl font-bold text-amber-50 sm:text-3xl">
                😇 สิ่งอำนวยความสะดวก
              </h3>

              <p className="mt-2 text-sm text-stone-400">
                เราเตรียมสิ่งจำเป็นสำหรับการพักผ่อนของคุณไว้ให้เรียบร้อย
              </p>

            </div>


            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🛋️ พื้นที่ส่วนตัว
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                ❄️ เครื่องปรับอากาศ
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                📌 ตู้เย็น / มินิบาร์
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🧺 ผ้าขนหนู
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🧖‍♀️ เสื้อคลุมอาบน้ำ
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🫧 สบู่เหลว
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🧻 ทิชชู / น้ำดื่ม
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                📌 ไดร์เป่าผม
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                ☕️ กาแฟซอง / โอวัลติน
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🫖 กาน้ำร้อน
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🔌 ปลั๊กไฟพ่วง
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🪥 แปรงสีฟัน / ยาสีฟัน
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🧴 ผ้าคลุมผม
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🧴 สำลีก้าน
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                📌 พัดลม
              </div>

              <div className="rounded-2xl bg-white/5 p-4 text-sm text-stone-200">
                🚿 เครื่องทำน้ำอุ่น
              </div>

            </div>

          </div>

        </section>


        {/* =========================
            BOOKING
        ========================== */}

        <BookingForm room={room} />

      </main>
    </>
  );
}