import { getBooking } from "@/lib/getBooking";

import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentSummary from "@/components/payment/PaymentSummary";
import PaymentQR from "@/components/payment/PaymentQR";
import PaymentBank from "@/components/payment/PaymentBank";
import PaymentSlip from "@/components/payment/PaymentSlip";

type Props = {
  params: Promise<{
    bookingCode: string;
  }>;
};

export default async function PaymentPage({
  params,
}: Props) {
  const { bookingCode } = await params;

  const booking = await getBooking(bookingCode);

  return (
    <main className="min-h-screen bg-stone-100">

      <div className="mx-auto max-w-5xl p-8">

        <PaymentHeader
  bookingCode={booking.booking_code}
/>

<PaymentSummary
  booking={booking}
/>

<PaymentQR />

<PaymentBank />

<PaymentSlip
  bookingCode={booking.booking_code}
/>

      </div>

    </main>
  );
}