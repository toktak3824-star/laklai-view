type Props = {
  booking: {
    room_id: string;
    guest_name: string;
    check_in: string;
    check_out: string;
    adults: number;
    children: number;
    total_price: number;
    nature_experience_selected?: boolean | null;
nature_experience_date?: string | null;
nature_experience_participants?: number | null;
nature_experience_total?: number | null;
  };
};

export default function PaymentSummary({
  booking,
}: Props) {

  const roomName = (() => {
    switch (booking.room_id) {
      case "house1":
        return "บ้านสวนวิถี";
      case "house2":
        return "บ้านพักใจ";
      case "house3":
        return "บ้านอุ่นใจ";
      case "house4":
        return "บ้านสุขใจ";
      default:
        return booking.room_id;
    }
  })();

  const checkIn = new Date(booking.check_in);
  const checkOut = new Date(booking.check_out);

  const nights =
    Math.ceil(
      (checkOut.getTime() - checkIn.getTime()) /
      (1000 * 60 * 60 * 24)
    );

  return (

    <div className="mt-8 rounded-3xl bg-white p-8 shadow">

      <h2 className="mb-6 text-2xl font-bold text-stone-800">
        รายละเอียดการจอง
      </h2>

      <div className="grid gap-5 md:grid-cols-2">

        <div>

          <p className="text-sm text-stone-500">
            ผู้จอง
          </p>

          <p className="text-xl font-semibold text-stone-800">
            {booking.guest_name}
          </p>

        </div>

        <div>

          <p className="text-sm text-stone-500">
            บ้านพัก
          </p>

          <p className="text-xl font-semibold text-stone-800">
            {roomName}
          </p>

        </div>

        <div>

          <p className="text-sm text-stone-500">
            วันเข้าพัก
          </p>

          <p className="text-lg font-medium text-stone-800">
            {booking.check_in}
          </p>

        </div>

        <div>

          <p className="text-sm text-stone-500">
            วันออก
          </p>

          <p className="text-lg font-medium text-stone-800">
            {booking.check_out}
          </p>

        </div>

        <div>

          <p className="text-sm text-stone-500">
            จำนวนคืน
          </p>

          <p className="text-lg font-medium text-stone-800">
            {nights} คืน
          </p>

        </div>

        <div>

          <p className="text-sm text-stone-500">
            ผู้เข้าพัก
          </p>

          <p className="text-lg font-medium text-stone-800">
            ผู้ใหญ่ {booking.adults} คน
            {booking.children > 0 &&
              ` เด็ก ${booking.children} คน`}
          </p>

        </div>

      </div>
{booking.nature_experience_selected &&
  (booking.nature_experience_participants ?? 0) > 0 && (
    <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4">
      <h3 className="font-semibold text-green-900">
        🌿 วิถีบ้านป่า
      </h3>

      <div className="mt-2 space-y-1 text-sm text-stone-700">
        <p>
          📅 วันที่กิจกรรม:{" "}
          {booking.nature_experience_date
            ? new Date(
                `${booking.nature_experience_date}T00:00:00`
              ).toLocaleDateString("th-TH", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "-"}
        </p>

        <p>
          👥 ผู้เข้าร่วม:{" "}
          {booking.nature_experience_participants} คน
        </p>

        <p>
          💰 ค่ากิจกรรม: ฿
          {(booking.nature_experience_total ?? 0).toLocaleString()}
        </p>
      </div>
    </div>
  )}
      <div className="mt-8 rounded-2xl bg-green-50 p-6">

        <p className="text-sm text-green-700">
          ยอดที่ต้องชำระ
        </p>

        <h3 className="mt-2 text-4xl font-bold text-green-700">
          ฿{Number(booking.total_price).toLocaleString()}
        </h3>

      </div>

    </div>

  );
}