import Link from "next/link";
import { DINNER_MENU } from "@/data/dinnerMenu";
import PublicDinnerOrder from "../../components/PublicDinnerOrder";

export default function DinnerMenuPage() {
  // จัดกลุ่มเมนูตามประเภทอาหาร
  const groupedMenu = DINNER_MENU.reduce(
    (groups, item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }

      groups[item.category].push(item);
      return groups;
    },
    {} as Record<string, typeof DINNER_MENU>
  );

  return (
    <main className="min-h-screen bg-[#f5f3ed]">
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-stone-900 px-4 py-16 text-center sm:py-24">
        <div className="relative z-10 mx-auto max-w-3xl">
          <p className="text-xs font-semibold tracking-[0.4em] text-green-300 sm:text-sm">
            LAKLAI VIEW
          </p>

          <h1 className="mt-5 text-3xl font-bold text-amber-100 sm:text-5xl">
            อาหารวิถีบ้านป่า
          </h1>

          <p className="mt-4 text-sm leading-7 text-green-100/90 sm:text-lg">
            อิ่มอร่อยกับอาหารพื้นบ้าน ท่ามกลางธรรมชาติ
            <br className="hidden sm:block" />
            เติมเต็มช่วงเวลาพักผ่อนที่หลักลายวิว
          </p>

          <div className="mt-8">
            <span className="rounded-full border border-green-300/30 bg-green-800/50 px-5 py-2 text-xs text-green-100 sm:text-sm">
              LOCAL FOOD • NATURE • HAPPINESS
            </span>
          </div>
        </div>

        <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-green-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      </section>

      {/* INTRODUCTION */}
      <section className="mx-auto max-w-5xl px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-green-950 sm:text-3xl">
          เมนูอาหารของเรา
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
          เลือกอิ่มอร่อยกับเมนูอาหารหลากหลาย
          ทั้งอาหารพื้นบ้าน เมนูแนะนำ และอาหารจานเดียว
          ที่เตรียมไว้สำหรับช่วงเวลาพักผ่อนของคุณ
        </p>
      </section>

      {/* MENU */}
      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="space-y-10">
          {Object.entries(groupedMenu).map(([category, items]) => (
            <div key={category}>
              <div className="mb-5 flex items-center gap-3">
                <div className="h-8 w-1.5 rounded-full bg-green-800" />
                <h2 className="text-xl font-bold text-green-950 sm:text-2xl">
                  {category}
                </h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold text-stone-900">
                        {item.name}
                      </h3>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-bold text-green-800">
                        ฿{item.price.toLocaleString("th-TH")}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DINNER ORDER FORM */}
      <section id="dinner-order" className="bg-[#f5f3ed] px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <h2 className="text-2xl font-bold text-green-950 sm:text-3xl">
              สั่งอาหารเย็นล่วงหน้า
            </h2>
            <p className="mt-3 text-sm leading-7 text-stone-600 sm:text-base">
              สำหรับลูกค้าที่จองบ้านพักและได้รับการยืนยันการจองแล้ว
              กรุณาตรวจสอบด้วยอีเมลและเบอร์โทรศัพท์ที่ใช้จอง
            </p>
          </div>

          <PublicDinnerOrder />
        </div>
      </section>

      {/* ORDER INFORMATION */}
      <section className="bg-green-950 px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-2xl font-bold text-amber-100 sm:text-3xl">
            เติมเต็มมื้อพิเศษระหว่างการพักผ่อน
          </h2>

          <p className="mt-4 text-sm leading-7 text-green-100/90 sm:text-base">
            รายการอาหารจะแยกจากค่าที่พัก และชำระค่าอาหาร ณ วันเข้าพัก
          </p>

          <p className="mt-3 text-xs text-green-200/70">
            กรุณาสั่งอาหารล่วงหน้าอย่างน้อย 1 วันก่อนวันเช็กอิน
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/#rooms"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-green-600 px-8 py-3 font-bold text-white transition hover:bg-green-500"
            >
              🏡 เลือกบ้านพัก
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-green-300/40 px-8 py-3 font-semibold text-green-100 transition hover:bg-green-900"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-950 px-4 py-6 text-center">
        <p className="text-xs tracking-[0.25em] text-green-300">
          LAKLAI VIEW
        </p>

        <p className="mt-2 text-sm text-stone-400">
          หลักลาย view วิถีบ้านป่า
        </p>
      </footer>
    </main>
  );
}
