import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "กิจกรรมวิถีบ้านป่า",
  description:
    "สัมผัสธรรมชาติริมลำธาร เดินชมป่า ล่องห่วงยาง เก็บผักกูด หาวัตถุดิบ และทำอาหารร่วมกันที่หลักลาย view วิถีบ้านป่า จังหวัดน่าน",
};

const activities = [
  {
    number: "01",
    title: "เดินชมธรรมชาติ",
    description:
      "เดินเส้นทางธรรมชาติระยะสั้นประมาณ 700–800 เมตร ค่อย ๆ เรียนรู้บรรยากาศของผืนป่าและลำธาร",
    image: "/images/nature-experience/activity-walk.jpg",
    alt: "ผู้ร่วมกิจกรรมเดินชมธรรมชาติในป่า",
  },
  {
    number: "02",
    title: "ล่องห่วงยางไปตามลำธาร",
    description:
      "สนุกกับการล่องห่วงยางไปตามสายน้ำระยะทางประมาณ 1 กิโลเมตร ใช้เวลาพักผ่อนและสนุกไปด้วยกัน",
    image: "/images/nature-experience/activity-tubing.jpg",
    alt: "ผู้ร่วมกิจกรรมล่องห่วงยางในลำธาร",
  },
  {
    number: "03",
    title: "เก็บผักกูดและหาวัตถุดิบจากธรรมชาติ",
    description:
      "ใช้เวลาประมาณ 30–40 นาที เรียนรู้การเก็บผักกูดและหาวัตถุดิบจากลำธาร เช่น ปลา กุ้ง หอย หรือปู ตามสภาพพื้นที่และฤดูกาล",
    image: "/images/nature-experience/activity-foraging.jpg",
    alt: "ผู้ร่วมกิจกรรมเก็บผักและหาวัตถุดิบจากธรรมชาติ",
  },
  {
    number: "04",
    title: "ทำอาหารและรับประทานร่วมกัน",
    description:
      "นำวัตถุดิบที่หาได้มาทำอาหารแบบเรียบง่าย รับประทานร่วมกันริมธาร ถ่ายภาพและพักผ่อน ก่อนเดินทางกลับด้วยรถรับส่ง",
    image: "/images/nature-experience/activity-cooking.jpg",
    alt: "การทำอาหารและรับประทานอาหารร่วมกันริมลำธาร",
  },
];

const gallery = [
  { src: "/images/nature-experience/nature1.jpg", alt: "วัตถุดิบจากลำธาร" },
  { src: "/images/nature-experience/nature2.jpg", alt: "บรรยากาศลำธารท่ามกลางธรรมชาติ" },
  { src: "/images/nature-experience/nature3.jpg", alt: "การเตรียมอาหารด้วยกระบอกไม้ไผ่" },
  { src: "/images/nature-experience/nature4.jpg", alt: "การเก็บผักและเตรียมวัตถุดิบ" },
];

const videos = [
  { src: "/images/nature-experience/nature5.mp4", title: "บรรยากาศการเตรียมอาหาร" },
  { src: "/images/nature-experience/nature6.mp4", title: "บรรยากาศริมลำธาร" },
  { src: "/images/nature-experience/nature7.mp4", title: "ช่วงเวลาล่องห่วงยาง" },
  { src: "/images/nature-experience/nature8.mp4", title: "เรียนรู้วิถีธรรมชาติ" },
  { src: "/images/nature-experience/nature9.mp4", title: "สนุกกับสายน้ำ" },
  { src: "/images/nature-experience/nature10.mp4", title: "รับประทานอาหารร่วมกันริมธาร" },
];

export default function NatureExperiencePage() {
  return (
    <main className="min-h-screen bg-stone-950 text-white">
      <section className="px-5 pb-12 pt-14 sm:px-8 sm:pb-16 sm:pt-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs font-semibold tracking-[0.35em] text-green-300 sm:text-sm">
            LAKLAI VIEW • NAN
          </p>
          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
            กิจกรรมวิถีบ้านป่า
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/75 sm:text-xl">
            ใช้เวลาสัมผัสธรรมชาติริมลำธาร เรียนรู้วิถีชีวิตเรียบง่าย
            เก็บผักกูด หาวัตถุดิบจากสายน้ำ และทำอาหารรับประทานร่วมกัน
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-green-300">เวลาเริ่มกิจกรรม</p>
              <p className="mt-2 text-xl font-bold">10:30–11:00 น.</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-green-300">ระยะเวลา</p>
              <p className="mt-2 text-xl font-bold">ประมาณ 4 ชั่วโมง</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-green-300">เสร็จกิจกรรม</p>
              <p className="mt-2 text-xl font-bold">ประมาณ 14:30–15:00 น.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold tracking-[0.2em] text-green-300">
              THE EXPERIENCE
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              4 ขั้นตอนของประสบการณ์วิถีบ้านป่า
            </h2>
            <p className="mt-3 max-w-3xl leading-7 text-white/65">
              กิจกรรมเน้นการใช้เวลาร่วมกัน เรียนรู้ธรรมชาติ และสนุกไปด้วยกันเป็นกลุ่ม
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {activities.map((activity) => (
              <article
                key={activity.number}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
              >
                <div className="w-full bg-black/30">
                  <Image
                    src={activity.image}
                    alt={activity.alt}
                    width={1200}
                    height={1800}
                    className="block h-auto w-full object-contain"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-6 sm:p-7">
                  <p className="text-sm font-semibold tracking-widest text-green-300">
                    {activity.number}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{activity.title}</h3>
                  <p className="mt-3 leading-8 text-white/70">
                    {activity.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1f4d38] px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm font-semibold tracking-[0.2em] text-green-100">
            THREE SPECIAL MEALS
          </p>
          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            อาหารพิเศษ 3 มื้อ สำหรับผู้ร่วมกิจกรรม
          </h2>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
              <p className="text-sm text-green-100">มื้อที่ 1</p>
              <h3 className="mt-2 text-xl font-bold">อาหารกลางวันริมธาร</h3>
              <p className="mt-2 text-sm leading-7 text-white/80">
                รับประทานอาหารท่ามกลางธรรมชาติริมลำธาร
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
              <p className="text-sm text-green-100">มื้อที่ 2</p>
              <h3 className="mt-2 text-xl font-bold">อาหารเย็น</h3>
              <p className="mt-2 text-sm leading-7 text-white/80">
                อิ่มอร่อยกับมื้อเย็นในบรรยากาศวิถีบ้านป่า
              </p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 p-5">
              <p className="text-sm text-green-100">มื้อที่ 3</p>
              <h3 className="mt-2 text-xl font-bold">อาหารเช้า</h3>
              <p className="mt-2 text-sm leading-7 text-white/80">
                เริ่มต้นเช้าวันใหม่ท่ามกลางธรรมชาติ
              </p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-white/75">
            หมายเหตุ: อาหารเช้าเป็นมื้อที่รวมอยู่ในบริการที่พักอยู่แล้ว
          </p>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold tracking-[0.2em] text-green-300">
              PHOTO GALLERY
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              ภาพบรรยากาศกิจกรรม
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {gallery.map((photo) => (
              <div
                key={photo.src}
                className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
              >
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  width={900}
                  height={700}
                  className="h-48 w-full object-cover sm:h-56"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-14 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8">
            <p className="text-sm font-semibold tracking-[0.2em] text-green-300">
              ACTIVITY VIDEOS
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              วิดีโอบรรยากาศวิถีบ้านป่า
            </h2>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {videos.map((video) => (
              <article
                key={video.src}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]"
              >
                <video
                  src={video.src}
                  controls
                  playsInline
                  preload="metadata"
                  className="aspect-video w-full bg-black object-contain"
                >
                  เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                </video>
                <h3 className="px-4 py-3 font-semibold">{video.title}</h3>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
          <h2 className="text-2xl font-bold sm:text-3xl">
            มาสัมผัสวิถีบ้านป่าด้วยกัน
          </h2>
          <p className="mt-4 max-w-3xl leading-8 text-white/70">
            กิจกรรมนี้เหมาะกับการใช้เวลาร่วมกันเป็นกลุ่ม
            กรุณาแจ้งความประสงค์เข้าร่วมกิจกรรมล่วงหน้า
            เพื่อให้ทีมงานเตรียมการดูแลและจัดเตรียมอาหารได้อย่างเหมาะสม
          </p>
          <Link
            href="/#rooms"
            className="mt-7 inline-flex min-h-14 items-center justify-center rounded-full bg-green-600 px-8 py-4 font-bold text-white transition hover:bg-green-500"
          >
            จองบ้านพักและเลือกกิจกรรม
          </Link>
        </div>
      </section>
    </main>
  );
}