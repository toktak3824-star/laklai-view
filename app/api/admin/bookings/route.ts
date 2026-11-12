import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";

const BUCKET = "payment-slips";

// ==========================================
// PAYMENT TYPE
// ==========================================

type PaymentRecord = {
  id: string;
  booking_id: string;
  amount: number | string | null;
  slip_url: string | null;
  verified: boolean | null;
  verified_at: string | null;
  verified_by: string | null;
  created_at: string;
};

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "ไม่มีสิทธิ์เข้าถึง" },
      { status: 401 }
    );
  }

  try {
    // ==========================================
    // 1. ดึงรายการจองทั้งหมด
    // ==========================================

    const { data: bookings, error: bookingError } =
      await supabaseAdmin
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

    if (bookingError) {
      console.error("ADMIN BOOKINGS ERROR =", bookingError);

      return NextResponse.json(
        { error: "ไม่สามารถโหลดรายการจองได้" },
        { status: 500 }
      );
    }

    const bookingList = bookings ?? [];

    const bookingIds = bookingList.map(
      (booking) => booking.id
    );

    // ==========================================
    // 2. ดึงประวัติการรับเงินจริง
    // ==========================================

    let payments: PaymentRecord[] = [];

    if (bookingIds.length > 0) {
      const { data: paymentData, error: paymentError } =
        await supabaseAdmin
          .from("payments")
          .select("*")
          .in("booking_id", bookingIds)
          .order("created_at", { ascending: true });

      if (paymentError) {
        console.error("ADMIN PAYMENTS ERROR =", paymentError);

        return NextResponse.json(
          { error: "ไม่สามารถโหลดประวัติการชำระเงินได้" },
          { status: 500 }
        );
      }

      payments = (paymentData ?? []) as PaymentRecord[];
    }

    // ==========================================
    // 3. รวมยอดรับเงินจริงแยกตามรายการจอง
    // ==========================================

    const paymentsByBooking = new Map<
      string,
      PaymentRecord[]
    >();

    for (const payment of payments) {
      const key = payment.booking_id;

      if (!paymentsByBooking.has(key)) {
        paymentsByBooking.set(key, []);
      }

      paymentsByBooking.get(key)!.push(payment);
    }

    // ==========================================
    // 4. สร้าง Signed URL สำหรับเปิดดูสลิป
    // ==========================================

    const bookingsWithDetails = await Promise.all(
      bookingList.map(async (booking) => {
        let slipUrl = booking.slip_url;

        if (slipUrl) {
          const slipPath = String(slipUrl).trim();

          if (
            !slipPath.startsWith("http://") &&
            !slipPath.startsWith("https://")
          ) {
            const { data: signedData, error: signedError } =
              await supabaseAdmin.storage
                .from(BUCKET)
                .createSignedUrl(slipPath, 60 * 10);

            if (signedError || !signedData?.signedUrl) {
              console.error(
                "CREATE BOOKING SLIP SIGNED URL ERROR =",
                signedError
              );

              slipUrl = slipPath;
            } else {
              slipUrl = signedData.signedUrl;
            }
          }
        }

        // ประวัติการชำระเงินของรายการจองนี้
        const bookingPayments =
          paymentsByBooking.get(booking.id) ?? [];

        // เลือกเฉพาะรายการที่ตรวจสอบแล้ว
        const verifiedPayments = bookingPayments.filter(
          (payment) => payment.verified === true
        );

        // รวมยอดรับเงินจริง
        const receivedAmount = verifiedPayments.reduce(
          (sum, payment) =>
            sum + Number(payment.amount ?? 0),
          0
        );

        const totalPrice = Number(
          booking.total_price ?? 0
        );

        // ตรวจสอบว่ามีประวัติการชำระเงินหรือไม่
        const hasPaymentHistory =
          bookingPayments.length > 0;

        // คำนวณยอดคงเหลือ
        // หากไม่มีประวัติ จะไม่สมมติยอดคงเหลือ
        const remainingAmount = hasPaymentHistory
          ? Math.max(totalPrice - receivedAmount, 0)
          : null;

        return {
          ...booking,

          // URL สำหรับเปิดดูสลิป
          slip_url: slipUrl,

          // ประวัติการรับเงินจริง
          payments: bookingPayments,

          // ยอดที่ตรวจสอบแล้ว
          received_amount: receivedAmount,

          // ยอดคงเหลือ
          remaining_amount: remainingAmount,

          // มีประวัติการรับเงินจริงหรือไม่
          has_payment_history: hasPaymentHistory,

          // รายการเก่าที่ยังต้องตรวจสอบ
          needs_payment_review:
            booking.booking_status === "confirmed" &&
            !hasPaymentHistory,
        };
      })
    );

    return NextResponse.json(bookingsWithDetails);

  } catch (error) {
    console.error("ADMIN BOOKINGS SERVER ERROR =", error);

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}