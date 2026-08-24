import Link from "next/link";

const CONTACTS = {
  phone1: "0831565478",
  phone2: "0644709898",

  facebook:
    "https://www.facebook.com/profile.php?id=100063701012792",

  instagram:
    "https://www.instagram.com/laklai_view/?hl=th",

  tiktok:
    "https://www.tiktok.com/@laklaiview",

  map:
    "https://www.google.com/maps/place/%E0%B8%AB%E0%B8%A5%E0%B8%B1%E0%B8%81%E0%B8%A5%E0%B8%B2%E0%B8%A2+View/@18.9851377,101.0585772,17z/data=!4m14!1m7!3m6!1s0x3127c3e4b4549257:0xcc043d78518ca4c6!2z4Lir4Lil4Lix4LiB4Lil4Liy4LiiIFZpZXc!8m2!3d18.9851377!4d101.0611521!16s%2Fg%2F11qp1vb95m!3m5!1s0x3127c3e4b4549257:0xcc043d78518ca4c6!8m2!3d18.9851377!4d101.0611521!16s%2Fg%2F11qp1vb95m",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-stone-950 text-white">

      {/* Header */}
      <section className="relative overflow-hidden bg-gradient-to-b from-green-950 to-stone-950 px-5 pb-14 pt-28 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-5xl text-center">

          <p className="mb-3 text-xs font-semibold tracking-[0.35em] text-green-300 sm:text-sm">
            LAKLAI VIEW
          </p>

          <h1 className="text-4xl font-bold sm:text-5xl md:text-6xl">
            ติดต่อเรา
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
            หากต้องการสอบถามข้อมูลที่พัก การเดินทาง
            หรือรายละเอียดการจอง
            สามารถติดต่อหลักลาย View
            ได้ผ่านช่องทางด้านล่าง
          </p>

        </div>
      </section>


      {/* Contact Cards */}
      <section className="px-5 py-10 sm:px-6 sm:py-16">
        <div className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2">


          {/* Phone 1 */}
          <a
            href={`tel:${CONTACTS.phone1}`}
            className="group rounded-3xl border border-green-800 bg-green-950/40 p-6 transition hover:bg-green-900/50 sm:p-7"
          >
            <div className="text-3xl">
              📞
            </div>

            <h2 className="mt-4 text-xl font-bold">
              โทรหาเรา
            </h2>

            <p className="mt-2 text-sm leading-7 text-stone-300">
              สอบถามข้อมูลที่พัก
              และรายละเอียดการจอง
            </p>

            <p className="mt-4 text-lg font-bold text-green-300">
              083-156-5478
            </p>

            <p className="mt-1 text-xs text-stone-500">
              แตะเพื่อโทร
            </p>
          </a>


          {/* Phone 2 */}
          <a
            href={`tel:${CONTACTS.phone2}`}
            className="group rounded-3xl border border-green-800 bg-green-950/40 p-6 transition hover:bg-green-900/50 sm:p-7"
          >
            <div className="text-3xl">
              📱
            </div>

            <h2 className="mt-4 text-xl font-bold">
              โทรหาเรา
            </h2>

            <p className="mt-2 text-sm leading-7 text-stone-300">
              ติดต่อสอบถามเพิ่มเติม
              และเรื่องการเข้าพัก
            </p>

            <p className="mt-4 text-lg font-bold text-green-300">
              064-470-9898
            </p>

            <p className="mt-1 text-xs text-stone-500">
              แตะเพื่อโทร
            </p>
          </a>


          {/* Facebook */}
          <a
            href={CONTACTS.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-3xl border border-green-800 bg-green-950/40 p-6 transition hover:bg-green-900/50 sm:p-7"
          >
            <div className="text-3xl">
              📘
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Facebook
            </h2>

            <p className="mt-2 text-sm leading-7 text-stone-300">
              ติดตามข่าวสาร โปรโมชั่น
              และสอบถามการจอง
            </p>

            <p className="mt-4 font-semibold text-green-300">
              หลักลาย View
            </p>

            <p className="mt-1 text-xs text-stone-500">
              แตะเพื่อเปิด Facebook
            </p>
          </a>


          {/* Instagram */}
          <a
            href={CONTACTS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-3xl border border-green-800 bg-green-950/40 p-6 transition hover:bg-green-900/50 sm:p-7"
          >
            <div className="text-3xl">
              📸
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Instagram
            </h2>

            <p className="mt-2 text-sm leading-7 text-stone-300">
              ชมภาพบรรยากาศ
              และเรื่องราวจากหลักลาย View
            </p>

            <p className="mt-4 font-semibold text-green-300">
              @laklai_view
            </p>

            <p className="mt-1 text-xs text-stone-500">
              แตะเพื่อเปิด Instagram
            </p>
          </a>


          {/* TikTok */}
          <a
            href={CONTACTS.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-3xl border border-green-800 bg-green-950/40 p-6 transition hover:bg-green-900/50 sm:p-7"
          >
            <div className="text-3xl">
              🎵
            </div>

            <h2 className="mt-4 text-xl font-bold">
              TikTok
            </h2>

            <p className="mt-2 text-sm leading-7 text-stone-300">
              ชมบรรยากาศจริง
              และเรื่องราวของที่พัก
            </p>

            <p className="mt-4 font-semibold text-green-300">
              @laklaiview
            </p>

            <p className="mt-1 text-xs text-stone-500">
              แตะเพื่อเปิด TikTok
            </p>
          </a>


          {/* Google Maps */}
          <a
            href={CONTACTS.map}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-3xl border border-green-800 bg-green-950/40 p-6 transition hover:bg-green-900/50 sm:p-7"
          >
            <div className="text-3xl">
              📍
            </div>

            <h2 className="mt-4 text-xl font-bold">
              Google Maps
            </h2>

            <p className="mt-2 text-sm leading-7 text-stone-300">
              ดูตำแหน่งที่พัก
              และวางแผนการเดินทางมายังหลักลาย View
            </p>

            <p className="mt-4 font-semibold text-green-300">
              หลักลาย View
            </p>

            <p className="mt-1 text-xs text-stone-500">
              แตะเพื่อเปิดแผนที่
            </p>
          </a>

        </div>
      </section>


      {/* Location */}
      <section className="px-5 pb-14 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-5xl rounded-3xl border border-green-800 bg-stone-900 p-7 text-center sm:p-10">

          <div className="text-4xl">
            📍
          </div>

          <h2 className="mt-4 text-2xl font-bold">
            หลักลาย View
          </h2>

          <p className="mt-3 text-sm leading-8 text-stone-300 sm:text-base">
            อำเภอปัว จังหวัดน่าน
            <br />
            ใกล้ถนนเลข 3 ประมาณ 4.5 กิโลเมตร
            <br />
            เส้นทางมุ่งหน้าสู่บ่อเกลือ
          </p>

          <a
            href={CONTACTS.map}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-green-600 px-8 py-4 text-base font-bold text-white transition hover:bg-green-700 sm:w-auto sm:text-lg"
          >
            📍 เปิด Google Maps
          </a>

        </div>
      </section>


      {/* Booking CTA */}
      <section className="px-5 pb-20 sm:px-6">
        <div className="mx-auto max-w-5xl rounded-3xl bg-gradient-to-r from-green-900 to-green-950 p-8 text-center sm:p-12">

          <h2 className="text-2xl font-bold sm:text-3xl">
            พร้อมมาพักผ่อนกับเราแล้วหรือยัง?
          </h2>

          <p className="mt-3 text-sm leading-7 text-green-100 sm:text-base">
            เลือกบ้านพักและตรวจสอบวันว่าง
            ได้จากระบบจองของเรา
          </p>

          <Link
            href="/#rooms"
            className="mt-7 inline-flex min-h-14 w-full items-center justify-center rounded-full bg-green-500 px-8 py-4 text-lg font-bold text-white transition hover:bg-green-600 sm:w-auto"
          >
            จองที่พัก
          </Link>

        </div>
      </section>

    </main>
  );
}