import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";

const BUCKET = "payment-slips";
const RECEIPT_BUCKET = "booking-receipts";

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

// ==========================================
// RECEIPT TYPE
// ==========================================

type ReceiptRecord = {
  id: number;
  payment_id: string;
  booking_id: string;
  receipt_no: string;
  receipt_type: string;
  amount_received: number | string;
  booking_total: number | string;
  cumulative_received: number | string;
  remaining_amount: number | string;
  pdf_path: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  email_status: string;
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
    // 3. ดึงประวัติใบเสร็จ
    // ==========================================

    let receipts: ReceiptRecord[] = [];

    if (bookingIds.length > 0) {
      const { data: receiptData, error: receiptError } =
        await supabaseAdmin
          .from("booking_receipts")
          .select("*")
          .in("booking_id", bookingIds)
          .order("created_at", { ascending: true });

      if (receiptError) {
        console.error("ADMIN RECEIPTS ERROR =", receiptError);

        return NextResponse.json(
          { error: "ไม่สามารถโหลดประวัติใบเสร็จได้" },
          { status: 500 }
        );
      }

      receipts = (receiptData ?? []) as ReceiptRecord[];
    }

    // ==========================================
    // 4. รวมยอดรับเงินจริงแยกตามรายการจอง
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
    // 5. รวมใบเสร็จแยกตามรายการจอง
    // ==========================================

    const receiptsByBooking = new Map<
      string,
      ReceiptRecord[]
    >();

    for (const receipt of receipts) {
      const key = receipt.booking_id;

      if (!receiptsByBooking.has(key)) {
        receiptsByBooking.set(key, []);
      }

      receiptsByBooking.get(key)!.push(receipt);
    }

    // ==========================================
    // 6. สร้าง Signed URL สำหรับสลิปและใบเสร็จ
    // ==========================================

    const bookingsWithDetails = await Promise.all(
      bookingList.map(async (booking) => {
        // --------------------------------------
        // Signed URL สลิป
        // --------------------------------------

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

        // --------------------------------------
        // ประวัติการชำระเงิน
        // --------------------------------------

        const bookingPayments =
          paymentsByBooking.get(booking.id) ?? [];

        const verifiedPayments = bookingPayments.filter(
          (payment) => payment.verified === true
        );

        const receivedAmount = verifiedPayments.reduce(
          (sum, payment) =>
            sum + Number(payment.amount ?? 0),
          0
        );

        const totalPrice = Number(
          booking.total_price ?? 0
        );

        const hasPaymentHistory =
          bookingPayments.length > 0;

        const remainingAmount = hasPaymentHistory
          ? Math.max(totalPrice - receivedAmount, 0)
          : null;

        // --------------------------------------
        // ประวัติใบเสร็จ
        // --------------------------------------

        const bookingReceipts =
          receiptsByBooking.get(booking.id) ?? [];

        const receiptsWithUrls = await Promise.all(
          bookingReceipts.map(async (receipt) => {
            let receiptUrl: string | null = null;

            if (receipt.pdf_path) {
              const { data: signedData, error: signedError } =
                await supabaseAdmin.storage
                  .from(RECEIPT_BUCKET)
                  .createSignedUrl(
                    receipt.pdf_path,
                    60 * 10
                  );

              if (signedError || !signedData?.signedUrl) {
                console.error(
                  "CREATE RECEIPT SIGNED URL ERROR =",
                  receipt.id,
                  signedError
                );
              } else {
                receiptUrl = signedData.signedUrl;
              }
            }

            return {
              ...receipt,
              amount_received: Number(
                receipt.amount_received ?? 0
              ),
              booking_total: Number(
                receipt.booking_total ?? 0
              ),
              cumulative_received: Number(
                receipt.cumulative_received ?? 0
              ),
              remaining_amount: Number(
                receipt.remaining_amount ?? 0
              ),
              receipt_url: receiptUrl,
            };
          })
        );

        // --------------------------------------
        // ส่งข้อมูลกลับหน้า Admin
        // --------------------------------------

        return {
          ...booking,

          slip_url: slipUrl,

          payments: bookingPayments,

          received_amount: receivedAmount,

          remaining_amount: remainingAmount,

          has_payment_history: hasPaymentHistory,

          needs_payment_review:
            booking.booking_status === "confirmed" &&
            !hasPaymentHistory,

          // ข้อมูลใบเสร็จทั้งหมดของรายการจอง
          receipts: receiptsWithUrls,

          // มีใบเสร็จหรือไม่
          has_receipts: receiptsWithUrls.length > 0,
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