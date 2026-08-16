import BookingTable from "@/components/admin/BookingTable";
export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-stone-100 p-8">

      <h1 className="mb-8 text-4xl font-bold">
        Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-4">

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm text-gray-500">วันนี้</h2>
          <p className="mt-2 text-3xl font-bold text-stone-900">
  2
</p>

<p className="text-stone-600">
  เช็กอิน
</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm text-gray-500">วันนี้</h2>
          <p className="mt-2 text-3xl font-bold text-stone-900">
  1
</p>

<p className="text-stone-600">
  เช็กเอาท์
</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm text-gray-500">รออนุมัติ</h2>
          <p className="mt-2 text-3xl font-bold text-stone-900">
  3
</p>

<p className="text-stone-600">
  รายการ
</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow">
          <h2 className="text-sm text-gray-500">รายได้วันนี้</h2>
          <p className="mt-2 text-3xl font-bold text-green-700">
            ฿12,970
          </p>
        </div>

      </div>
      <BookingTable />
    </main>
  );
}