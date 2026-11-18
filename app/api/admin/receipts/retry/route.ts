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

  const raw = String(value).slice(0, 10);
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);

  if (!match) return raw;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const thaiMonths = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return raw;
  }

  // ใช้เลขอารบิกแทนเลขไทย เพื่อให้แสดงผลได้กับฟอนต์ที่ใช้อยู่
  return `${day} ${thaiMonths[month - 1]} ${year + 543}`;
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
// สร้าง PDF ใบเสร็จ
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
        "หลักลายวิว วิถีบ้านป่า",
        left,
        48,
        { width, align: "center" }
      );

    doc
  .font("Thai")
  .fontSize(10)
  .fillColor("#57534e")
  .text(
    "LAKLAI VIEW - NATURE STAY",
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
      .font("ThaiBold")
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
      value: string,
      valueFont = "ThaiBold"
    ) => {
      void en;
      doc
        .font("Thai")
        .fontSize(10)
        .fillColor("#78716c")
        .text(th, left, y, {
          width: 175,
        });

      doc
        .font(valueFont)
        .fontSize(11)
        .fillColor("#292524")
        .text(value, left + 185, y, {
          width: width - 185,
        });
    };

    label("เลขที่ใบเสร็จ", "Receipt No.", 190, data.receiptNo, "ThaiBold");
    label("วันที่รับเงิน", "Payment Date", 222, thaiDate(data.paymentDate));
    label("ชื่อผู้เข้าพัก", "Guest Name", 254, data.guestName);
    label("รหัสการจอง", "Booking Code", 286, data.bookingCode, "ThaiBold");
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
      `${money(data.paymentAmount)} บาท`
    );

    label(
      "มูลค่าการจอง",
      "Booking Total",
      477,
      `${money(data.bookingTotal)} บาท`
    );

    label(
      "ยอดรับสะสม",
      "Total Received",
      509,
      `${money(data.cumulativeReceived)} บาท`
    );

    label(
      "ยอดคงเหลือ",
      "Balance Due",
      541,
      `${money(data.remainingAmount)} บาท`
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
      .font("Thai")
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
        "ขอบคุณที่เลือกพักกับหลักลายวิว วิถีบ้านป่า",
        left,
        690,
        { width, align: "center" }
      );

    doc
      .font("Thai")
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
// ADMIN RETRY RECEIPT
// =============================================

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "ไม่มีสิทธิ์เข้าถึง" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const receiptId = Number(body.receiptId);
    const action = String(body.action ?? "").trim();

    if (!Number.isSafeInteger(receiptId) || receiptId <= 0) {
      return NextResponse.json(
        { success: false, error: "รหัสใบเสร็จไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (action !== "generate_pdf" && action !== "send_email") {
      return NextResponse.json(
        { success: false, error: "คำสั่งไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // 1) อ่านใบเสร็จเดิม
    const { data: receipt, error: receiptError } = await supabaseAdmin
      .from("booking_receipts")
      .select("*")
      .eq("id", receiptId)
      .maybeSingle();

    if (receiptError) throw receiptError;
    if (!receipt) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลใบเสร็จ" },
        { status: 404 }
      );
    }

    // 2) ตรวจสอบประวัติรับเงินจริงเดิม (อ่านอย่างเดียว ไม่เรียก RPC)
    const { data: payment, error: paymentError } = await supabaseAdmin
      .from("payments")
      .select("id, booking_id, amount, verified, verified_at, created_at")
      .eq("id", receipt.payment_id)
      .eq("booking_id", receipt.booking_id)
      .eq("verified", true)
      .maybeSingle();

    if (paymentError) throw paymentError;
    if (!payment) {
      return NextResponse.json(
        { success: false, error: "ไม่พบประวัติการรับเงินจริงที่ยืนยันแล้ว" },
        { status: 409 }
      );
    }

    // 3) อ่านข้อมูลการจองเดิม
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("id", receipt.booking_id)
      .maybeSingle();

    if (bookingError) throw bookingError;
    if (!booking) {
      return NextResponse.json(
        { success: false, error: "ไม่พบข้อมูลการจอง" },
        { status: 404 }
      );
    }

    const paymentAmount = Number(receipt.amount_received);
    const bookingTotal = Number(receipt.booking_total);
    const cumulativeReceived = Number(receipt.cumulative_received);
    const remainingAmount = Number(receipt.remaining_amount);
    const paymentDate =
      payment.verified_at ?? payment.created_at ?? receipt.created_at;
    const pdfPath = `${receipt.booking_id}/${receipt.payment_id}.pdf`;

    let receiptRecord: AnyRecord = receipt;
    let pdfAvailable = false;
    let pdfBuffer: Buffer | null = null;
    let pdfErrorMessage: string | null = null;

    // 4) สร้าง PDF แยกจากอีเมล
    // generate_pdf = ต้องสร้าง PDF ให้สำเร็จ
    // send_email = พยายามสร้าง/อ่าน PDF แต่ห้ามให้ PDF error ขวางอีเมล
    if (action === "generate_pdf" || !receiptRecord.pdf_path) {
      try {
        const generatedPdf = await createReceiptPdf({
          receiptNo: receiptRecord.receipt_no,
          receiptType: receiptRecord.receipt_type,
          guestName: safeText(booking.guest_name),
          bookingCode: safeText(booking.booking_code),
          room: roomName(booking.room_id),
          checkIn: booking.check_in,
          checkOut: booking.check_out,
          paymentDate,
          paymentAmount,
          bookingTotal,
          cumulativeReceived,
          remainingAmount,
        });

        const { error: uploadError } = await supabaseAdmin.storage
          .from(RECEIPT_BUCKET)
          .upload(pdfPath, generatedPdf, {
            contentType: "application/pdf",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: updatedReceipt, error: updateError } =
          await supabaseAdmin
            .from("booking_receipts")
            .update({ pdf_path: pdfPath })
            .eq("id", receiptRecord.id)
            .select("*")
            .single();

        if (updateError) throw updateError;

        receiptRecord = updatedReceipt;
        pdfBuffer = generatedPdf;
        pdfAvailable = true;
      } catch (error) {
        pdfErrorMessage =
          error instanceof Error ? error.message : String(error);
        console.error("RETRY RECEIPT PDF ERROR =", error);

        if (action === "generate_pdf") {
          throw new Error(`สร้าง PDF ไม่สำเร็จ: ${pdfErrorMessage}`);
        }
      }
    }

    // ถ้าไม่ได้สร้างใหม่ ให้ลองอ่านไฟล์เดิมจาก Storage
    if (!pdfAvailable && receiptRecord.pdf_path) {
      try {
        const { data: file, error: downloadError } =
          await supabaseAdmin.storage
            .from(RECEIPT_BUCKET)
            .download(receiptRecord.pdf_path);

        if (downloadError || !file) {
          throw downloadError ?? new Error("ไม่พบไฟล์ PDF ใน Storage");
        }

        pdfBuffer = Buffer.from(await file.arrayBuffer());
        pdfAvailable = true;
      } catch (error) {
        pdfErrorMessage =
          error instanceof Error ? error.message : String(error);
        console.warn("EXISTING RECEIPT PDF UNAVAILABLE =", error);

        // หากส่งอีเมล ให้ลองสร้างไฟล์ใหม่อีกครั้ง แต่ไม่บังคับสำเร็จ
        if (action === "send_email") {
          try {
            const generatedPdf = await createReceiptPdf({
              receiptNo: receiptRecord.receipt_no,
              receiptType: receiptRecord.receipt_type,
              guestName: safeText(booking.guest_name),
              bookingCode: safeText(booking.booking_code),
              room: roomName(booking.room_id),
              checkIn: booking.check_in,
              checkOut: booking.check_out,
              paymentDate,
              paymentAmount,
              bookingTotal,
              cumulativeReceived,
              remainingAmount,
            });

            const { error: uploadError } = await supabaseAdmin.storage
              .from(RECEIPT_BUCKET)
              .upload(pdfPath, generatedPdf, {
                contentType: "application/pdf",
                upsert: true,
              });

            if (uploadError) throw uploadError;

            const { data: updatedReceipt, error: updateError } =
              await supabaseAdmin
                .from("booking_receipts")
                .update({ pdf_path: pdfPath })
                .eq("id", receiptRecord.id)
                .select("*")
                .single();

            if (updateError) throw updateError;

            receiptRecord = updatedReceipt;
            pdfBuffer = generatedPdf;
            pdfAvailable = true;
            pdfErrorMessage = null;
          } catch (regenerateError) {
            pdfErrorMessage =
              regenerateError instanceof Error
                ? regenerateError.message
                : String(regenerateError);
            console.error("RETRY PDF REGENERATION ERROR =", regenerateError);
          }
        }
      }
    }

    // 5) สร้าง signed URL เท่าที่มีไฟล์จริง
    let receiptUrl: string | null = null;
    if (pdfAvailable && receiptRecord.pdf_path) {
      const { data: signed, error: signedError } = await supabaseAdmin.storage
        .from(RECEIPT_BUCKET)
        .createSignedUrl(receiptRecord.pdf_path, 60 * 60 * 24 * 7);

      if (!signedError) receiptUrl = signed?.signedUrl ?? null;
      else console.warn("RECEIPT SIGNED URL ERROR =", signedError);
    }

    if (action === "generate_pdf") {
      return NextResponse.json({
        success: true,
        message: "สร้างใบเสร็จเรียบร้อยแล้ว",
        receiptId: receiptRecord.id,
        receiptNo: receiptRecord.receipt_no,
        receiptUrl,
        pdfPath: receiptRecord.pdf_path,
        emailSent: receiptRecord.email_sent,
        emailStatus: receiptRecord.email_status,
      });
    }

    // 6) ส่งอีเมลลูกค้า โดยไม่บังคับว่าต้องมี PDF
    const customerEmail = String(booking.email ?? "").trim();
    const fromEmail = process.env.RESEND_FROM_EMAIL;

    if (!customerEmail) {
      throw new Error("ไม่พบอีเมลลูกค้าใน bookings.email");
    }
    if (!resend || !fromEmail) {
      throw new Error("ยังไม่ได้ตั้งค่า RESEND_API_KEY หรือ RESEND_FROM_EMAIL");
    }

    // Claim สถานะเพื่อกันการกดส่งพร้อมกันหลายครั้ง
    const { data: claimed, error: claimError } = await supabaseAdmin
      .from("booking_receipts")
      .update({ email_status: "sending" })
      .eq("id", receiptRecord.id)
      .in("email_status", ["pending", "failed", "sent"])
      .select("id")
      .maybeSingle();

    if (claimError) throw claimError;
    if (!claimed) {
      return NextResponse.json(
        {
          success: false,
          error: "รายการนี้กำลังส่งอีเมลอยู่ กรุณารอสักครู่แล้วลองใหม่",
        },
        { status: 409 }
      );
    }

    try {
      const attachments: Array<{ filename: string; content: Buffer }> = [];
      if (pdfAvailable && pdfBuffer) {
        attachments.push({
          filename: `${receiptRecord.receipt_no}.pdf`,
          content: pdfBuffer,
        });
      }

      const hasPdf = attachments.length > 0;
      const result = await resend.emails.send({
        from: fromEmail,
        to: customerEmail,
        subject: `ยืนยันการรับชำระเงิน ${receiptRecord.receipt_no} | หลักลายวิว วิถีบ้านป่า`,
        html: `
          <div style="font-family:Arial,sans-serif;line-height:1.8;color:#333;max-width:600px;margin:auto;padding:20px">
            <h2 style="color:#31513d">ยืนยันการรับชำระเงินเรียบร้อยแล้ว</h2>
            <p>เรียนคุณ ${escapeHtml(booking.guest_name)}</p>
            <p>หลักลายวิว วิถีบ้านป่า ได้รับชำระเงินสำหรับการจองของท่านเรียบร้อยแล้ว</p>
            <hr />
            <p><b>เลขที่ใบเสร็จ:</b> ${escapeHtml(receiptRecord.receipt_no)}</p>
            <p><b>เลขที่การจอง:</b> ${escapeHtml(booking.booking_code)}</p>
            <p><b>บ้านพัก:</b> ${escapeHtml(roomName(booking.room_id))}</p>
            <p><b>วันเข้าพัก:</b> ${escapeHtml(thaiDate(booking.check_in))}</p>
            <p><b>วันออก:</b> ${escapeHtml(thaiDate(booking.check_out))}</p>
            <p><b>ยอดรับเงินครั้งนี้:</b> ${money(paymentAmount)} บาท</p>
            <p><b>ยอดรับสะสม:</b> ${money(cumulativeReceived)} บาท</p>
            <p><b>ยอดคงเหลือ:</b> ${money(remainingAmount)} บาท</p>
            <hr />
            ${
              hasPdf
                ? "<p>แนบใบเสร็จรับเงินเป็นไฟล์ PDF มาในอีเมลฉบับนี้แล้ว</p>"
                : "<p>การยืนยันรับชำระเงินสำเร็จแล้ว ขณะนี้ใบเสร็จ PDF อยู่ระหว่างจัดทำ และจะส่งให้เพิ่มเติมเมื่อพร้อม</p>"
            }
            <p>ขอบคุณที่เลือกพักกับ <b>หลักลายวิว วิถีบ้านป่า</b></p>
          </div>
        `,
        ...(attachments.length ? { attachments } : {}),
      });

      if (result.error) throw result.error;

      const { error: sentUpdateError } = await supabaseAdmin
        .from("booking_receipts")
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
          email_status: "sent",
        })
        .eq("id", receiptRecord.id);

      if (sentUpdateError) throw sentUpdateError;

      return NextResponse.json({
        success: true,
        message: hasPdf
          ? "ส่งอีเมลยืนยันพร้อมใบเสร็จ PDF เรียบร้อยแล้ว"
          : "ส่งอีเมลยืนยันรับเงินแล้ว (ยังไม่มีไฟล์ PDF แนบ)",
        receiptId: receiptRecord.id,
        receiptNo: receiptRecord.receipt_no,
        receiptUrl,
        emailSent: true,
        emailStatus: "sent",
        pdfAvailable,
        pdfError: pdfErrorMessage,
      });
    } catch (emailError) {
      const message =
        emailError instanceof Error ? emailError.message : String(emailError);

      await supabaseAdmin
        .from("booking_receipts")
        .update({ email_status: "failed" })
        .eq("id", receiptRecord.id);

      throw new Error(`ส่งอีเมลไม่สำเร็จ: ${message}`);
    }
  } catch (error) {
    console.error("ADMIN RECEIPT RETRY ERROR =", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการจัดการใบเสร็จ",
      },
      { status: 500 }
    );
  }
}
