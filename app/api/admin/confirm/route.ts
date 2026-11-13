import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { Resend } from "resend";
import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const RECEIPT_BUCKET = "booking-receipts";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>;

function money(value: unknown): string {
  const n = Number(value ?? 0);

  return (Number.isFinite(n) ? n : 0).toLocaleString("th-TH");
}

function safeText(value: unknown): string {
  return (
    String(value ?? "-")
      .replace(/[\r\n]+/g, " ")
      .trim() || "-"
  );
}

function escapeHtml(value: unknown): string {
  return safeText(value).replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char] ?? char;
  });
}

function thaiDate(value: unknown): string {
  if (!value) return "-";

  const date = new Date(
    `${String(value).slice(0, 10)}T00:00:00+07:00`
  );

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function roomName(roomId: unknown): string {
  const names: Record<string, string> = {
    house1: "บ้านสวนวิถี",
    house2: "บ้านพักใจ",
    house3: "บ้านอุ่นใจ",
    house4: "บ้านสุขใจ",
  };

  const id = String(roomId ?? "");

  return names[id] ?? (id || "-");
}

// =============================================
// สร้างใบเสร็จ PDF
// =============================================

async function createReceiptPdf(data: {
  receiptNo: string;
  receiptType: string;
  guestName: string;
  bookingCode: string;
  room: string;
  checkIn: string;
  checkOut: string;
  paymentDate: string;
  paymentAmount: number;
  bookingTotal: number;
  cumulativeReceived: number;
  remainingAmount: number;
}): Promise<Buffer> {
  const regularFont = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSansThai-Regular.ttf"
  );

  const boldFont = path.join(
    process.cwd(),
    "public",
    "fonts",
    "NotoSansThai-Bold.ttf"
  );

  if (
    !fs.existsSync(regularFont) ||
    !fs.existsSync(boldFont)
  ) {
    throw new Error(
      "ไม่พบฟอนต์ Noto Sans Thai ใน public/fonts"
    );
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 48,
      bufferPages: true,
      info: {
        Title: `Receipt ${data.receiptNo}`,
        Author: "Laklai View วิถีบ้านป่า",
        Subject: "Payment Receipt",
      },
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk: Buffer) => {
      chunks.push(chunk);
    });

    doc.on("error", reject);

    doc.on("end", () => {
      resolve(Buffer.concat(chunks));
    });

    doc.registerFont("Thai", regularFont);
    doc.registerFont("ThaiBold", boldFont);

    const left = 48;
    const right = 547;
    const width = right - left;

    doc
      .font("ThaiBold")
      .fontSize(20)
      .fillColor("#31513d")
      .text(
        "หลักลาย view วิถีบ้านป่า",
        left,
        48,
        { width, align: "center" }
      );

    doc
      .font("Thai")
      .fontSize(10)
      .fillColor("#57534e")
      .text(
        "LAKLAI VIEW · NATURE STAY",
        left,
        78,
        { width, align: "center" }
      );

    doc
      .font("ThaiBold")
      .fontSize(18)
      .fillColor("#292524")
      .text(
        data.receiptType === "deposit"
          ? "ใบเสร็จรับเงินมัดจำ"
          : "ใบเสร็จรับเงิน",
        left,
        112,
        { width, align: "center" }
      );

    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#292524")
      .text(
        data.receiptType === "deposit"
          ? "DEPOSIT RECEIPT"
          : "PAYMENT RECEIPT",
        left,
        140,
        { width, align: "center" }
      );

    doc
      .moveTo(left, 170)
      .lineTo(right, 170)
      .strokeColor("#d6d3d1")
      .stroke();

    const label = (
      th: string,
      en: string,
      y: number,
      value: string
    ) => {
      doc
        .font("Thai")
        .fontSize(10)
        .fillColor("#78716c")
        .text(`${th} / ${en}`, left, y, {
          width: 175,
        });

      doc
        .font("ThaiBold")
        .fontSize(11)
        .fillColor("#292524")
        .text(value, left + 185, y, {
          width: width - 185,
        });
    };

    label("เลขที่ใบเสร็จ", "Receipt No.", 190, data.receiptNo);
    label("วันที่รับเงิน", "Payment Date", 222, thaiDate(data.paymentDate));
    label("ชื่อผู้เข้าพัก", "Guest Name", 254, data.guestName);
    label("รหัสการจอง", "Booking Code", 286, data.bookingCode);
    label("บ้านพัก", "Accommodation", 318, data.room);
    label("วันเข้าพัก", "Check-in", 350, thaiDate(data.checkIn));
    label("วันออก", "Check-out", 382, thaiDate(data.checkOut));

    doc
      .moveTo(left, 425)
      .lineTo(right, 425)
      .strokeColor("#d6d3d1")
      .stroke();

    label(
      "ยอดรับเงินครั้งนี้",
      "Amount Received",
      445,
      `${money(data.paymentAmount)} บาท / THB`
    );

    label(
      "มูลค่าการจอง",
      "Booking Total",
      477,
      `${money(data.bookingTotal)} บาท / THB`
    );

    label(
      "ยอดรับสะสม",
      "Total Received",
      509,
      `${money(data.cumulativeReceived)} บาท / THB`
    );

    label(
      "ยอดคงเหลือ",
      "Balance Due",
      541,
      `${money(data.remainingAmount)} บาท / THB`
    );

    doc
      .moveTo(left, 590)
      .lineTo(right, 590)
      .strokeColor("#d6d3d1")
      .stroke();

    doc
      .font("Thai")
      .fontSize(9)
      .fillColor("#57534e")
      .text(
        "เอกสารนี้ออกให้เพื่อเป็นหลักฐานการรับชำระเงินตามจำนวนที่ระบุข้างต้น",
        left,
        610,
        { width, align: "center" }
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .text(
        "This document is issued as evidence of payment received as stated above.",
        left,
        630,
        { width, align: "center" }
      );

    doc
      .font("ThaiBold")
      .fontSize(11)
      .fillColor("#31513d")
      .text(
        "ขอบคุณที่เลือกพักกับหลักลาย view วิถีบ้านป่า",
        left,
        690,
        { width, align: "center" }
      );

    doc
      .font("Helvetica")
      .fontSize(9)
      .fillColor("#78716c")
      .text(
        "Thank you for choosing Laklai View.",
        left,
        712,
        { width, align: "center" }
      );

    doc.end();
  });
}

// =============================================
// ADMIN CONFIRM PAYMENT
// =============================================

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      {
        success: false,
        error: "ไม่มีสิทธิ์เข้าถึง",
      },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();

    const id = String(body.id ?? "").trim();
    const amount = Number(body.amount);

    const manuallyVerifiedWithoutSlip =
      body.manually_verified_without_slip === true;

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบรหัสการจอง",
        },
        { status: 400 }
      );
    }

    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาระบุยอดเงินจริงเป็นจำนวนเต็มที่มากกว่า 0",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 1. ค้นหาข้อมูลการจอง
    // =========================================

    const {
      data: booking,
      error: bookingError,
    } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (bookingError) throw bookingError;

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบข้อมูลการจอง",
        },
        { status: 404 }
      );
    }

    if (booking.booking_status === "cancelled") {
      return NextResponse.json(
        {
          success: false,
          error: "รายการจองนี้ถูกยกเลิกแล้ว",
        },
        { status: 409 }
      );
    }

    const bookingTotal = Number(booking.total_price ?? 0);

    if (
      !Number.isFinite(bookingTotal) ||
      bookingTotal <= 0 ||
      amount > bookingTotal
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "ยอดรับเงินไม่ถูกต้องหรือเกินมูลค่าการจอง",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 2. ตรวจสอบสลิป
    // =========================================

    if (
      !booking.slip_url &&
      !manuallyVerifiedWithoutSlip
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ไม่มีสลิป กรุณายืนยันว่าได้ตรวจสอบเงินเข้าบัญชีแล้ว",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 3. บันทึกเงินจริงผ่าน RPC เดิม
    // =========================================

    const {
      data: paymentResult,
      error: paymentError,
    } = await supabaseAdmin.rpc(
      "confirm_booking_payment",
      {
        p_booking_id: booking.id,
        p_amount: amount,
        p_verified_by: "admin",
      }
    );

    if (paymentError) {
      return NextResponse.json(
        {
          success: false,
          error:
            paymentError.message ||
            "ไม่สามารถบันทึกยอดรับเงินจริงได้",
        },
        { status: 400 }
      );
    }

    if (!paymentResult?.success) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่สามารถยืนยันการชำระเงินได้",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 4. เตรียมยอดเงินจากผล RPC
    // =========================================

    const totalPrice = Number(
      paymentResult.total_price
    );

    const receivedAmount = Number(
      paymentResult.received_amount
    );

    const remainingAmount = Number(
      paymentResult.remaining_amount
    );

    // =========================================
    // 5. ค้นหารายการรับเงินจริง
    // รองรับกรณีไม่มีสลิป
    // =========================================

    let payment: AnyRecord | null = null;

    let receiptNo: string | null = null;
    let receiptUrl: string | null = null;
    let emailSent = false;
    let receiptError: string | null = null;

    try {
      const {
        data: paymentRecord,
        error: paymentLookupError,
      } = await supabaseAdmin
        .from("payments")
        .select(
          "id, amount, verified_at, verified, created_at"
        )
        .eq("booking_id", booking.id)
        .eq("amount", amount)
        .eq("verified", true)
        .order("created_at", {
          ascending: false,
        })
        .limit(1)
        .maybeSingle();

      if (paymentLookupError) {
        throw paymentLookupError;
      }

      if (!paymentRecord) {
        throw new Error(
          "ไม่พบประวัติการรับเงินจริงในฐานข้อมูล"
        );
      }

      payment = paymentRecord;

      // =======================================
      // 6. สร้างเลขที่ใบเสร็จ
      // =======================================

      const paymentAmount = Number(payment.amount);

      const receiptType =
        paymentAmount >= totalPrice
          ? "full"
          : receivedAmount === paymentAmount
            ? "deposit"
            : "payment";

      const paymentDate =
        payment.verified_at ??
        new Date().toISOString();

      receiptNo =
        `LK-${new Date(paymentDate)
          .toISOString()
          .slice(0, 10)
          .replace(/-/g, "")}-${String(payment.id)
          .slice(0, 8)
          .toUpperCase()}`;

      const pdfPath =
        `${booking.id}/${payment.id}.pdf`;

      // =======================================
      // 7. บันทึกข้อมูลใบเสร็จ
      // =======================================

      const {
        data: insertedReceipt,
        error: insertError,
      } = await supabaseAdmin
        .from("booking_receipts")
        .insert({
          receipt_no: receiptNo,
          receipt_type: receiptType,
          payment_id: payment.id,
          booking_id: booking.id,
          amount_received: paymentAmount,
          booking_total: totalPrice,
          cumulative_received: receivedAmount,
          remaining_amount: remainingAmount,
          pdf_path: null,
          email_sent: false,
          email_status: "pending",
        })
        .select("*")
        .maybeSingle();

      let receipt: AnyRecord | null = insertedReceipt;

      if (insertError) {
        if (insertError.code !== "23505") {
          throw insertError;
        }

        const {
          data: existingReceipt,
          error: existingError,
        } = await supabaseAdmin
          .from("booking_receipts")
          .select("*")
          .eq("payment_id", payment.id)
          .maybeSingle();

        if (existingError) throw existingError;

        receipt = existingReceipt;
      }

      if (!receipt) {
        throw new Error(
          "ไม่สามารถสร้างข้อมูลใบเสร็จได้"
        );
      }

      let receiptRecord: AnyRecord = receipt;

      // =======================================
      // 8. สร้าง PDF ถ้ายังไม่มีไฟล์
      // =======================================

      if (!receiptRecord.pdf_path) {
        const pdf = await createReceiptPdf({
          receiptNo: receiptRecord.receipt_no ?? receiptNo,
          receiptType:
            receiptRecord.receipt_type ?? receiptType,
          guestName: safeText(booking.guest_name),
          bookingCode: safeText(booking.booking_code),
          room: roomName(booking.room_id),
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          paymentDate,
          paymentAmount,
          bookingTotal: totalPrice,
          cumulativeReceived: receivedAmount,
          remainingAmount,
        });

        const {
          error: uploadError,
        } = await supabaseAdmin.storage
          .from(RECEIPT_BUCKET)
          .upload(pdfPath, pdf, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: updatedReceipt,
          error: updateError,
        } = await supabaseAdmin
          .from("booking_receipts")
          .update({
            pdf_path: pdfPath,
          })
          .eq("id", receiptRecord.id)
          .select("*")
          .single();

        if (updateError) throw updateError;

        receiptRecord = updatedReceipt;
      }

      // =======================================
      // 9. ส่งใบเสร็จให้ลูกค้าทางอีเมล
      // =======================================

      const fromEmail = process.env.RESEND_FROM_EMAIL;
      const customerEmail = String(
        booking.email ?? ""
      ).trim();

      emailSent = Boolean(receiptRecord.email_sent);

      if (
        !emailSent &&
        customerEmail &&
        resend &&
        fromEmail
      ) {
        const {
          data: claimed,
          error: claimError,
        } = await supabaseAdmin
          .from("booking_receipts")
          .update({
            email_status: "sending",
          })
          .eq("id", receiptRecord.id)
          .eq("email_sent", false)
          .in("email_status", [
            "pending",
            "failed",
          ])
          .select("id")
          .maybeSingle();

        if (claimError) throw claimError;

        if (claimed) {
          const {
            data: file,
            error: downloadError,
          } = await supabaseAdmin.storage
            .from(RECEIPT_BUCKET)
            .download(receiptRecord.pdf_path);

          if (downloadError || !file) {
            throw (
              downloadError ??
              new Error("ไม่พบไฟล์ PDF ใบเสร็จ")
            );
          }

          const arrayBuffer = await file.arrayBuffer();
          const pdfBuffer = Buffer.from(arrayBuffer);

          const result = await resend.emails.send({
            from: fromEmail,
            to: customerEmail,
            subject:
              `ใบเสร็จรับเงิน ${receiptRecord.receipt_no} | หลักลาย view วิถีบ้านป่า`,
            html: `
              <div style="font-family:Arial,sans-serif;line-height:1.8;color:#333;max-width:600px;margin:auto;padding:20px">
                <h2 style="color:#31513d">
                  ยืนยันการรับชำระเงินเรียบร้อยแล้ว
                </h2>

                <p>เรียนคุณ ${escapeHtml(booking.guest_name)}</p>

                <p>
                  หลักลาย view วิถีบ้านป่า
                  ได้รับชำระเงินสำหรับการจองของท่านเรียบร้อยแล้ว
                </p>

                <hr />

                <p>
                  <b>เลขที่ใบเสร็จ:</b>
                  ${escapeHtml(receiptRecord.receipt_no)}
                </p>

                <p>
                  <b>เลขที่การจอง:</b>
                  ${escapeHtml(booking.booking_code)}
                </p>

                <p>
                  <b>บ้านพัก:</b>
                  ${escapeHtml(roomName(booking.room_id))}
                </p>

                <p>
                  <b>วันเข้าพัก:</b>
                  ${escapeHtml(thaiDate(booking.check_in))}
                </p>

                <p>
                  <b>วันออก:</b>
                  ${escapeHtml(thaiDate(booking.check_out))}
                </p>

                <p>
                  <b>ยอดรับเงินครั้งนี้:</b>
                  ${money(paymentAmount)} บาท
                </p>

                <p>
                  <b>ยอดรับสะสม:</b>
                  ${money(receivedAmount)} บาท
                </p>

                <p>
                  <b>ยอดคงเหลือ:</b>
                  ${money(remainingAmount)} บาท
                </p>

                <hr />

                <p>
                  เราได้แนบใบเสร็จรับเงินภาษาไทยและอังกฤษ
                  เป็นไฟล์ PDF มาในอีเมลฉบับนี้แล้ว
                </p>

                <p>
                  ขอบคุณที่เลือกพักกับ
                  <b>หลักลาย view วิถีบ้านป่า</b>
                </p>
              </div>
            `,
            attachments: [
              {
                filename: `${receiptRecord.receipt_no}.pdf`,
                content: pdfBuffer,
              },
            ],
          });

          if (result.error) {
            await supabaseAdmin
              .from("booking_receipts")
              .update({
                email_status: "failed",
              })
              .eq("id", receiptRecord.id);

            throw result.error;
          }

          const {
            error: sentUpdateError,
          } = await supabaseAdmin
            .from("booking_receipts")
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString(),
              email_status: "sent",
            })
            .eq("id", receiptRecord.id);

          if (sentUpdateError) throw sentUpdateError;

          emailSent = true;
        }
      }

      // =======================================
      // 10. สร้างลิงก์ดาวน์โหลดใบเสร็จ
      // =======================================

      const {
        data: signed,
        error: signedError,
      } = await supabaseAdmin.storage
        .from(RECEIPT_BUCKET)
        .createSignedUrl(
          receiptRecord.pdf_path,
          60 * 60 * 24 * 7
        );

      if (signedError) {
        console.error("RECEIPT SIGNED URL ERROR =", signedError);
      }

      receiptUrl = signed?.signedUrl ?? null;

    } catch (error) {
      console.error(
        "RECEIPT GENERATION / EMAIL ERROR =",
        error
      );

      receiptError =
        error instanceof Error
          ? error.message
          : String(error);
    }

    // =========================================
    // 11. ยืนยันสำเร็จ
    // =========================================

    return NextResponse.json({
      success: true,
      message:
        "บันทึกยอดรับเงินจริงและยืนยันการจองเรียบร้อยแล้ว",

      emailSent,

      receiptNo,
      receiptUrl,
      receiptError,

      totalPrice,
      receivedAmount,
      remainingAmount,

      paymentStatus: paymentResult.payment_status,
    });

  } catch (error) {
    console.error(
      "ADMIN CONFIRM ERROR =",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการยืนยันการชำระเงิน",
      },
      { status: 500 }
    );
  }
}