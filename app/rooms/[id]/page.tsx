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
      canonical: `https://laklaiview.com/rooms/${room.id}`,
    },

    openGraph: {
      title,
      description,
      url: `https://laklaiview.com/rooms/${room.id}`,
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
                alt={`${room.title} - Laklai View ที่พักปัว น่าน`}
                fill
                className="object-cover hover:scale-105 transition duration-300"
              />
            </div>
          ))}
        </div>

        <BookingForm room={room} />
      </main>
    </>
  );
}