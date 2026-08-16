type Props = {
  bookingCode: string;
};

export default function PaymentHeader({
  bookingCode,
}: Props) {
  return (
    <div className="rounded-3xl bg-gradient-to-r from-green-900 to-green-700 p-8 text-white shadow-lg">

      <h1 className="text-4xl font-bold">
        Laklai View
      </h1>

      <p className="mt-2 text-green-100">
        กรุณาชำระเงินเพื่อยืนยันการจอง
      </p>

      <div className="mt-6 rounded-2xl bg-white/10 p-5">

        <p className="text-sm uppercase tracking-wider text-green-100">
          Booking Code
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          {bookingCode}
        </h2>

      </div>

    </div>
  );
}