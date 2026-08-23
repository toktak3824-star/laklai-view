import BookingTable from "@/components/admin/BookingTable";

export default function BookingsPage() {
  return (
    <main className="min-h-screen bg-stone-100">

      <div className="mb-8">

        <p className="text-sm font-semibold tracking-[0.35em] text-emerald-800">
          LAKLAI VIEW
        </p>

        <div className="mt-2">

          <h1 className="text-4xl font-bold text-stone-950">
            รายการจองที่พัก
          </h1>

          <p className="mt-2 text-base font-medium text-stone-700">
            ตรวจสอบ ยืนยัน และจัดการรายการจองของลูกค้า
          </p>

        </div>

      </div>

      <section className="rounded-2xl bg-white p-6 shadow-sm">

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h2 className="text-2xl font-bold text-stone-950">
              รายการจองทั้งหมด
            </h2>

            <p className="mt-1 text-sm font-medium text-stone-600">
              รายการจองจะแสดงจากข้อมูลในระบบ
            </p>

          </div>

        </div>

        <BookingTable />

      </section>

    </main>
  );
}