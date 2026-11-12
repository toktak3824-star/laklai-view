import { getBooking } from "@/lib/getBooking";

import PaymentHeader from "@/components/payment/PaymentHeader";
import PaymentSummary from "@/components/payment/PaymentSummary";
import PaymentQR from "@/components/payment/PaymentQR";
import PaymentBank from "@/components/payment/PaymentBank";
import PaymentSlip from "@/components/payment/PaymentSlip";
import DinnerOrder from "@/components/payment/DinnerOrder";

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

  const hasNatureExperience =
    booking.nature_experience_selected === true;

  return (
    <main className="min-h-screen bg-stone-100">
      <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-8">

        {/* =====================================
            HEADER
        ===================================== */}

        <PaymentHeader
          bookingCode={booking.booking_code}
        />

        {/* =====================================
            BOOKING SUMMARY
        ===================================== */}

        <PaymentSummary booking={booking} />

        {/* =====================================
            DINNER NOTICE
            แยกค่าอาหารออกจากยอดโอน
        ===================================== */}

        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5">

          <h2 className="text-lg font-bold text-amber-900">
            🍽️ อาหารเย็นสั่งล่วงหน้า
          </h2>

          <p className="mt-2 text-sm leading-7 text-amber-900">
            ลูกค้าสามารถเลือกรายการอาหารและจำนวนที่ต้องการได้
            โดยค่าอาหารจะแยกจากค่าที่พักและกิจกรรม
            และชำระเพิ่มเติมในวันเช็กอิน
          </p>

          {hasNatureExperience ? (
            <p className="mt-2 text-sm font-medium leading-7 text-amber-900">
              ยอดชำระวันนี้เป็นค่าที่พักและกิจกรรมวิถีบ้านป่า
              ไม่รวมค่าอาหาร เนื่องจากกิจกรรมมีอาหารรวมอยู่แล้ว
              กรุณาตรวจสอบรายการอาหารก่อนสั่งเพิ่มเติม
            </p>
          ) : (
            <p className="mt-2 text-sm font-medium leading-7 text-amber-900">
              ยอดชำระวันนี้เป็นค่าที่พักเท่านั้น
              ไม่รวมค่าอาหาร ค่าอาหารเพิ่มเติม (ถ้ามี)
              ชำระแยกในวันเช็กอิน
            </p>
          )}

          <p className="mt-2 text-sm text-amber-800">
            สามารถกลับมาสั่งอาหารเพิ่มเติมภายหลังได้
            โดยใช้ Booking Code และอีเมลที่ใช้จอง
            ก่อนวันเข้าพักอย่างน้อย 1 วัน
          </p>

        </section>

        {/* =====================================
            DINNER ORDER
        ===================================== */}

        <DinnerOrder booking={booking} />

        {/* =====================================
            PAYMENT
        ===================================== */}

        <section className="space-y-5">

          <div>
            <h2 className="text-xl font-bold text-stone-800">
              💳 ชำระค่าที่พักและกิจกรรม
            </h2>

            <p className="mt-1 text-sm leading-6 text-stone-600">
              กรุณาตรวจสอบยอดชำระจากสรุปรายการจอง
              ก่อนทำการโอนเงิน
            </p>
          </div>

          <PaymentQR />

          <PaymentBank />

          <PaymentSlip
            bookingCode={booking.booking_code}
          />

        </section>

      </div>
    </main>
  );
}