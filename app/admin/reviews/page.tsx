export default function ReviewsAdminPage() {
  return (
    <main className="min-h-screen bg-stone-100">
      <p className="text-sm font-semibold tracking-[0.35em] text-emerald-700">LAKLAI VIEW ADMIN</p>
      <h1 className="mt-2 text-4xl font-bold text-stone-900">รีวิว</h1>
      <p className="mt-3 text-stone-600">พื้นที่สำหรับตรวจสอบรีวิวลูกค้า</p>

      <section className="mt-8 rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-amber-50 p-4 text-3xl">⭐</div>
          <div>
            <h2 className="text-xl font-bold text-stone-950">ยังไม่มีตารางรีวิวในฐานข้อมูลของโปรเจกต์</h2>
            <p className="mt-2 max-w-3xl leading-7 text-stone-600">
              ผมไม่สร้างข้อมูลรีวิวปลอมให้ระบบ เพราะในโค้ดชุดนี้ยังไม่พบตารางหรือ API สำหรับรีวิวจริง หากต้องการให้หน้านี้ดึงและจัดการรีวิวจาก Google หรือ Facebook ต้องเชื่อมบริการนั้นก่อน
            </p>
            <div className="mt-5 rounded-xl bg-stone-100 p-4 text-sm text-stone-700">
              สถานะ: <strong>หน้า Admin ทำงานและปลอดภัยแล้ว</strong> แต่แหล่งข้อมูลรีวิวยังไม่ได้เชื่อมเข้ากับระบบ
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
