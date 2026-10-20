import { calculatePaymentAmounts } from "@/utils/payment";

type Props = {
  booking: {
    room_id: string;
    guest_name: string;
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    total_price: number;
    dinner_total?: number | null;
    nature_experience_selected?: boolean | null;
    nature_experience_date?: string | null;
    nature_experience_participants?: number | null;
    nature_experience_total?: number | null;
  };
};

export default function PaymentSummary({ booking }: Props) {
  const roomName = (() => {
    switch (booking.room_id) {
      case "house1": return "บ้านสวนวิถี";
      case "house2": return "บ้านพักใจ";
      case "house3": return "บ้านอุ่นใจ";
      case "house4": return "บ้านสุขใจ";
      default: return booking.room_id;
    }
  })();

  const checkIn = new Date(`${booking.check_in}T00:00:00`);
  const checkOut = new Date(`${booking.check_out}T00:00:00`);
  const nights = Math.max(0, Math.round((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
  const total = Number(booking.total_price) || 0;
  const activityTotal = booking.nature_experience_selected ? Number(booking.nature_experience_total ?? 0) : 0;
  const lodgingTotal = Math.max(0, total - activityTotal);
  const {
  depositAmount: amountDueNow,
  balanceAmount: balanceDueAtCheckIn,
  totalPrice: paymentTotal,
} = calculatePaymentAmounts(total);

const isDeposit = paymentTotal >= 4000;
  const money = (value: number) => `฿${value.toLocaleString("th-TH")}`;

  return (
    <div className="mt-8 rounded-3xl bg-white p-6 shadow sm:p-8">
      <h2 className="mb-6 text-2xl font-bold text-stone-800">รายละเอียดการจอง</h2>
      <div className="grid gap-5 sm:grid-cols-2">
        <div><p className="text-sm text-stone-500">ผู้จอง</p><p className="text-xl font-semibold text-stone-800">{booking.guest_name}</p></div>
        <div><p className="text-sm text-stone-500">บ้านพัก</p><p className="text-xl font-semibold text-stone-800">{roomName}</p></div>
        <div><p className="text-sm text-stone-500">วันเข้าพัก</p><p className="text-lg font-medium text-stone-800">{checkIn.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</p></div>
        <div><p className="text-sm text-stone-500">วันออก</p><p className="text-lg font-medium text-stone-800">{checkOut.toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</p></div>
        <div><p className="text-sm text-stone-500">จำนวนคืน</p><p className="text-lg font-medium text-stone-800">{nights} คืน</p></div>
        <div><p className="text-sm text-stone-500">ผู้เข้าพัก</p><p className="text-lg font-medium text-stone-800">ผู้ใหญ่ {booking.adults} คน{booking.children > 0 ? ` เด็ก ${booking.children} คน` : ""}</p></div>
      </div>

      <div className="mt-6 space-y-3 rounded-2xl border border-stone-200 p-5">
        <div className="flex items-center justify-between gap-4 text-stone-700"><span>ค่าที่พักรวมค่าผู้เข้าพักเสริม</span><span className="font-semibold">{money(lodgingTotal)}</span></div>
        {booking.nature_experience_selected && activityTotal > 0 && (
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-green-900">🌿 วิถีบ้านป่า</h3>
            <p className="mt-2 text-sm text-stone-700">วันที่กิจกรรม: {booking.nature_experience_date ? new Date(`${booking.nature_experience_date}T00:00:00`).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" }) : "-"}</p>
            <p className="text-sm text-stone-700">ผู้เข้าร่วม: {booking.nature_experience_participants ?? 0} คน</p>
            <p className="font-semibold text-green-800">ค่ากิจกรรม: {money(activityTotal)}</p>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 border-t border-stone-200 pt-3 font-bold text-stone-900"><span>ยอดรวมค่าที่พักและกิจกรรม</span><span>{money(total)}</span></div>
        <div className="rounded-xl bg-green-50 p-4">
          <p className="text-sm font-semibold text-green-800">{isDeposit ? "เงินมัดจำ 50% ที่ต้องชำระตอนนี้" : "ยอดที่ต้องชำระตอนนี้ (ชำระเต็มจำนวน)"}</p>
          <p className="mt-1 text-3xl font-bold text-green-700">{money(amountDueNow)}</p>
          <p className="mt-2 text-sm text-stone-600">ยอดคงเหลือชำระวันเช็กอิน: <strong>{money(balanceDueAtCheckIn)}</strong></p>
        </div>
        {Number(booking.dinner_total ?? 0) > 0 && (
          <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">🍽️ ค่าอาหารที่สั่งล่วงหน้า: {money(Number(booking.dinner_total))}</p>
            <p className="mt-1">ค่าอาหารไม่รวมในยอดที่พักและกิจกรรม กรุณาชำระที่เคาน์เตอร์วันเช็กอิน</p>
          </div>
        )}
      </div>
    </div>
  );
}
