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
  return String(value ?? "-").replace(/[\r\n]+/g, " ").trim() || "-";
}

function escapeHtml(value: unknown): string {
  return safeText(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "\'": "&#39;",
  }[char] ?? char));
}

function thaiDate(value: unknown): string {
  if (!value) return "-";
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit", month: "long", year: "numeric",
    timeZone: "Asia/Bangkok",
  }).format(date);
}

function roomName(roomId: unknown): string {
  const names: Record<string, string> = {
    house1: "บ้านสวนวิถี", house2: "บ้านพักใจ",
    house3: "บ้านอุ่นใจ", house4: "บ้านสุขใจ",
  };
  const id = String(roomId ?? "");
  return names[id] ?? (id || "-");
}

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
  const regularFont = path.join(process.cwd(), "public", "fonts", "NotoSansThai-Regular.ttf");
  const boldFont = path.join(process.cwd(), "public", "fonts", "NotoSansThai-Bold.ttf");
  if (!fs.existsSync(regularFont) || !fs.existsSync(boldFont)) {
    throw new Error("ไม่พบไฟล์ฟอนต์ Noto Sans Thai ใน public/fonts");
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true, info: {
      Title: `Receipt ${data.receiptNo}`,
      Author: "Laklai View วิถีบ้านป่า",
      Subject: "Bilingual payment receipt",
    }});
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.registerFont("Thai", regularFont);
    doc.registerFont("ThaiBold", boldFont);
    const left = 48;
    const right = 547;
    const width = right - left;

    doc.font("ThaiBold").fontSize(20).fillColor("#31513d")
      .text("หลักลาย view วิถีบ้านป่า", left, 48, { width, align: "center" });
    doc.font("Thai").fontSize(10).fillColor("#57534e")
      .text("LAKLAI VIEW · NATURE STAY", left, 78, { width, align: "center" });
    doc.moveDown(1.2);
    doc.font("ThaiBold").fontSize(18).fillColor("#292524")
      .text(data.receiptType === "deposit" ? "ใบเสร็จรับเงินมัดจำ" : "ใบเสร็จรับเงิน", left, 112, { width, align: "center" });
    doc.font("Helvetica-Bold").fontSize(12).fillColor("#292524")
      .text(data.receiptType === "deposit" ? "DEPOSIT RECEIPT" : "PAYMENT RECEIPT", left, 140, { width, align: "center" });

    doc.moveTo(left, 170).lineTo(right, 170).strokeColor("#d6d3d1").stroke();
    const label = (th: string, en: string, y: number, value: string) => {
      doc.font("Thai").fontSize(10).fillColor("#78716c").text(`${th} / ${en}`, left, y, { width: 175 });
      doc.font("ThaiBold").fontSize(11).fillColor("#292524").text(value, left + 185, y, { width: width - 185 });
    };
    label("เลขที่ใบเสร็จ", "Receipt No.", 190, data.receiptNo);
    label("วันที่รับเงิน", "Payment Date", 222, thaiDate(data.paymentDate));
    label("ชื่อผู้เข้าพัก", "Guest Name", 254, data.guestName);
    label("รหัสการจอง", "Booking Code", 286, data.bookingCode);
    label("บ้านพัก", "Accommodation", 318, data.room);
    label("วันเข้าพัก", "Check-in", 350, thaiDate(data.checkIn));
    label("วันออก", "Check-out", 382, thaiDate(data.checkOut));

    doc.moveTo(left, 425).lineTo(right, 425).strokeColor("#d6d3d1").stroke();
    label("ยอดรับเงินครั้งนี้", "Amount Received", 445, `${money(data.paymentAmount)} บาท / THB`);
    label("มูลค่าการจอง", "Booking Total", 477, `${money(data.bookingTotal)} บาท / THB`);
    label("ยอดรับสะสม", "Total Received", 509, `${money(data.cumulativeReceived)} บาท / THB`);
    label("ยอดคงเหลือ", "Balance Due", 541, `${money(data.remainingAmount)} บาท / THB`);

    doc.moveTo(left, 590).lineTo(right, 590).strokeColor("#d6d3d1").stroke();
    doc.font("Thai").fontSize(9).fillColor("#57534e")
      .text("เอกสารนี้ออกให้เพื่อเป็นหลักฐานการรับชำระเงินตามจำนวนที่ระบุข้างต้น", left, 610, { width, align: "center" });
    doc.font("Helvetica").fontSize(9)
      .text("This document is issued as evidence of payment received as stated above.", left, 630, { width, align: "center" });
    doc.font("ThaiBold").fontSize(11).fillColor("#31513d")
      .text("ขอบคุณที่เลือกพักกับหลักลาย view วิถีบ้านป่า", left, 690, { width, align: "center" });
    doc.font("Helvetica").fontSize(9).fillColor("#78716c")
      .text("Thank you for choosing Laklai View.", left, 712, { width, align: "center" });
    doc.end();
  });
}

export async function POST(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = String(body.id ?? "").trim();
    const amount = Number(body.amount);
    if (!id) return NextResponse.json({ success: false, error: "ไม่พบรหัสการจอง" }, { status: 400 });
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: "กรุณาระบุยอดเงินจริงเป็นจำนวนเต็มที่มากกว่า 0" }, { status: 400 });
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings").select("*").eq("id", id).maybeSingle();
    if (bookingError) throw bookingError;
    if (!booking) return NextResponse.json({ success: false, error: "ไม่พบข้อมูลการจอง" }, { status: 404 });
    if (booking.booking_status === "cancelled") return NextResponse.json({ success: false, error: "รายการจองนี้ถูกยกเลิกแล้ว" }, { status: 409 });
    if (!booking.slip_url) return NextResponse.json({ success: false, error: "ไม่พบสลิป กรุณาตรวจสอบก่อนอนุมัติ" }, { status: 400 });

    // Keep the existing payment RPC unchanged.
    const { data: paymentResult, error: paymentError } = await supabaseAdmin.rpc("confirm_booking_payment", {
      p_booking_id: booking.id, p_amount: amount, p_verified_by: "admin",
    });
    if (paymentError) return NextResponse.json({ success: false, error: paymentError.message || "ไม่สามารถบันทึกยอดรับเงินจริงได้" }, { status: 400 });
    if (!paymentResult?.success) return NextResponse.json({ success: false, error: "ไม่สามารถยืนยันการชำระเงินได้" }, { status: 400 });

    // Resolve the exact verified payment created/updated by the RPC.
    const { data: payment, error: paymentLookupError } = await supabaseAdmin
      .from("payments").select("id, amount, verified_at, verified")
      .eq("booking_id", booking.id).eq("slip_url", booking.slip_url).eq("verified", true)
      .maybeSingle();
    if (paymentLookupError) throw paymentLookupError;
    if (!payment) throw new Error("ยืนยันยอดแล้ว แต่ไม่พบรายการชำระเงินที่ตรวจสอบแล้ว");

    const bookingTotal = Number(paymentResult.total_price);
    const cumulativeReceived = Number(paymentResult.received_amount);
    const remainingAmount = Number(paymentResult.remaining_amount);
    const paymentAmount = Number(payment.amount);
    const receiptType = paymentAmount >= bookingTotal ? "full" : cumulativeReceived === paymentAmount ? "deposit" : "payment";
    const receiptNo = `LK-${new Date(payment.verified_at ?? Date.now()).toISOString().slice(0, 10).replace(/-/g, "")}-${String(payment.id).slice(0, 8).toUpperCase()}`;
    const pdfPath = `${booking.id}/${payment.id}.pdf`;

    // Insert once per payment. A repeated admin confirmation reuses this receipt.
    const { data: insertedReceipt, error: insertError } = await supabaseAdmin
      .from("booking_receipts")
      .insert({
        receipt_no: receiptNo, receipt_type: receiptType, payment_id: payment.id,
        booking_id: booking.id, amount_received: paymentAmount,
        booking_total: bookingTotal, cumulative_received: cumulativeReceived,
        remaining_amount: remainingAmount, pdf_path: null,
        email_sent: false, email_status: "pending",
      })
      .select("*").maybeSingle();

let receipt: AnyRecord | null = insertedReceipt;

if (insertError) {
  if (insertError.code !== "23505") throw insertError;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("booking_receipts")
    .select("*")
    .eq("payment_id", payment.id)
    .maybeSingle();

  if (existingError) throw existingError;

  receipt = existing;
}

if (!receipt) {
  throw new Error("ไม่สามารถสร้างข้อมูลใบเสร็จได้");
}

// ใช้ตัวแปรที่ยืนยันแล้วว่าไม่เป็น null
let receiptRecord: AnyRecord = receipt;

    // Generate/upload only if a PDF has not already been stored.
    if (!receiptRecord.pdf_path) {
      const pdf = await createReceiptPdf({
        receiptNo: receiptRecord.receipt_no ?? receiptNo,
        receiptType: receiptRecord.receipt_type ?? receiptType,
        guestName: safeText(booking.guest_name),
        bookingCode: safeText(booking.booking_code),
        room: roomName(booking.room_id),
        checkIn: booking.check_in,
        checkOut: booking.check_out,
        paymentDate: payment.verified_at ?? new Date().toISOString(),
        paymentAmount: Number(receiptRecord.amount_received ?? paymentAmount),
        bookingTotal: Number(receiptRecord.booking_total ?? bookingTotal),
        cumulativeReceived: Number(receiptRecord.cumulative_received ?? cumulativeReceived),
        remainingAmount: Number(	receiptRecord.remaining_amount ?? remainingAmount),
      });
      const { error: uploadError } = await supabaseAdmin.storage.from(RECEIPT_BUCKET)
        .upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true });
      if (uploadError) throw uploadError;
      const { data: updated, error: updateError } = await supabaseAdmin
        .from("booking_receipts").update({ pdf_path: pdfPath }).eq("id", receiptRecord.id).select("*").single();
      if (updateError) throw updateError;
      receiptRecord = updated;
    }

    let emailSent = Boolean(	receiptRecord.email_sent);
    if (!emailSent && booking.email && resend && process.env.RESEND_FROM_EMAIL) {
      // Atomic claim prevents two concurrent admin clicks from sending the same receipt.
      const { data: claimed, error: claimError } = await supabaseAdmin
        .from("booking_receipts").update({ email_status: "sending" })
        .eq("id", receiptRecord.id).eq("email_sent", false)
        .in("email_status", ["pending", "failed"]).select("id").maybeSingle();
      if (claimError) throw claimError;

      if (claimed) {
        const { data: file, error: downloadError } = await supabaseAdmin.storage
          .from(RECEIPT_BUCKET).download(receiptRecord.pdf_path);
        if (downloadError || !file) throw downloadError ?? new Error("ไม่พบไฟล์ PDF ใบเสร็จ");
        const arrayBuffer = await file.arrayBuffer();
        const pdfBuffer = Buffer.from(arrayBuffer);
        const result = await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: booking.email,
          subject: `ใบเสร็จรับเงิน ${receiptRecord.receipt_no} | หลักลาย view วิถีบ้านป่า`,
          html: `<div style="font-family:Arial,sans-serif;line-height:1.8;color:#333;max-width:600px;margin:auto;padding:20px"><h2>ยืนยันการรับชำระเงินเรียบร้อยแล้ว</h2><p>เรียนคุณ ${escapeHtml(booking.guest_name)}</p><p>เราได้แนบใบเสร็จรับเงินภาษาไทยและอังกฤษมาในอีเมลฉบับนี้แล้ว</p><p><b>เลขที่ใบเสร็จ:</b> ${receiptRecord.receipt_no}</p><p><b>ยอดรับครั้งนี้:</b> ${money(receiptRecord.amount_received)} บาท</p><p><b>ยอดคงเหลือ:</b> ${money(	receiptRecord.remaining_amount)} บาท</p><p>ขอบคุณที่เลือกพักกับ <b>หลักลาย view วิถีบ้านป่า</b></p></div>`,
          attachments: [{ filename: `${receiptRecord.receipt_no}.pdf`, content: pdfBuffer }],
        });
        if (result.error) {
          await supabaseAdmin.from("booking_receipts").update({ email_status: "failed" }).eq("id", receiptRecord.id);
          throw result.error;
        }
        const { error: sentUpdateError } = await supabaseAdmin.from("booking_receipts")
          .update({ email_sent: true, email_sent_at: new Date().toISOString(), email_status: "sent" })
          .eq("id", receiptRecord.id);
        if (sentUpdateError) throw sentUpdateError;
        emailSent = true;
      }
    }

    const { data: signed } = await supabaseAdmin.storage.from(RECEIPT_BUCKET)
      .createSignedUrl(receiptRecord.pdf_path, 60 * 60 * 24 * 7);

    return NextResponse.json({
      success: true,
      message: "ยืนยันการชำระเงินและจัดทำใบเสร็จเรียบร้อยแล้ว",
      emailSent,
      receiptNo: receiptRecord.receipt_no,
      receiptUrl: signed?.signedUrl ?? null,
      totalPrice: paymentResult.total_price,
      receivedAmount: paymentResult.received_amount,
      remainingAmount: paymentResult.remaining_amount,
      paymentStatus: paymentResult.payment_status,
    });
  } catch (error) {
    console.error("ADMIN CONFIRM / RECEIPT ERROR =", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการยืนยันการชำระเงิน" }, { status: 500 });
  }
}
