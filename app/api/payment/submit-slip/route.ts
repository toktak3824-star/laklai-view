import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { sendBookingSlipNotifications } from "../../../../lib/email/booking-slip-notification";

export const runtime = "nodejs";

const BUCKET = "payment-slips";
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: Request) {
  let uploadedPath: string | null = null;

  try {
    const formData = await req.formData();
    const bookingCode = String(formData.get("bookingCode") ?? "").trim();
    const file = formData.get("slip");

    if (!bookingCode) {
      return NextResponse.json({ success: false, error: "ไม่พบเลขการจอง" }, { status: 400 });
    }
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "กรุณาแนบไฟล์สลิป" }, { status: 400 });
    }
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ success: false, error: "รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP" }, { status: 400 });
    }
    if (file.size <= 0 || file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "ไฟล์สลิปต้องมีขนาดไม่เกิน 10 MB" }, { status: 400 });
    }

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .eq("booking_code", bookingCode)
      .maybeSingle();

    if (bookingError) {
      console.error("BOOKING LOOKUP ERROR =", bookingError);
      return NextResponse.json({ success: false, error: "ไม่สามารถค้นหาข้อมูลการจองได้" }, { status: 500 });
    }
    if (!booking) {
      return NextResponse.json({ success: false, error: "ไม่พบข้อมูลการจองนี้" }, { status: 404 });
    }
    if (booking.booking_status === "cancelled") {
      return NextResponse.json({ success: false, error: "รายการจองนี้ถูกยกเลิกแล้ว ไม่สามารถส่งสลิปได้" }, { status: 409 });
    }
    if (booking.booking_status === "confirmed" || booking.payment_status === "paid") {
      return NextResponse.json({ success: false, error: "การจองนี้ได้รับการยืนยันการชำระเงินแล้ว" }, { status: 409 });
    }

    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const safeCode = bookingCode.replace(/[^a-zA-Z0-9_-]/g, "");
    uploadedPath = `bookings/${safeCode}/${safeCode}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(uploadedPath, buffer, {
        contentType: file.type,
        cacheControl: "31536000",
        upsert: false,
      });

    if (uploadError) {
      console.error("BOOKING SLIP UPLOAD ERROR =", uploadError);
      return NextResponse.json({ success: false, error: "อัปโหลดสลิปไม่สำเร็จ" }, { status: 500 });
    }

    // Conditional update prevents a cancelled/paid booking changing state during upload.
    const { data: updated, error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({ slip_url: uploadedPath, payment_status: "waiting_verification" })
      .eq("id", booking.id)
      .neq("booking_status", "cancelled")
      .neq("booking_status", "confirmed")
      .neq("payment_status", "paid")
      .select("id")
      .maybeSingle();

    if (updateError || !updated) {
      await supabaseAdmin.storage.from(BUCKET).remove([uploadedPath]);
      uploadedPath = null;
      console.error("BOOKING SLIP DB UPDATE ERROR =", updateError);
      return NextResponse.json({ success: false, error: "บันทึกสลิปไม่ได้ รายการจองอาจถูกยืนยันหรือยกเลิกไปแล้ว กรุณารีเฟรชหน้า" }, { status: 409 });
    }

    console.log("BOOKING SLIP SAVED =", bookingCode, uploadedPath);

    // Email failure must not undo a successfully saved slip. Failed email events can be retried.
    let emailNotifications: { customer: string; admin: string } | null = null;
    try {
      emailNotifications = await sendBookingSlipNotifications(
        { ...booking, payment_status: "waiting_verification" },
        uploadedPath,
      );
    } catch (emailError) {
      console.error("BOOKING SLIP EMAIL NOTIFICATION ERROR =", emailError);
    }

    return NextResponse.json({
      success: true,
      bookingCode,
      paymentStatus: "waiting_verification",
      message: "บันทึกสลิปเรียบร้อยแล้ว",
      emailNotifications,
    });
  } catch (error) {
    console.error("BOOKING SLIP POST ERROR =", error);
    if (uploadedPath) {
      await supabaseAdmin.storage.from(BUCKET).remove([uploadedPath]);
    }
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "เกิดข้อผิดพลาดในการส่งสลิป",
    }, { status: 500 });
  }
}

// GET — เปิดดูสลิปสำหรับ ADMIN เท่านั้น
export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ success: false, error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const bookingCode = String(searchParams.get("bookingCode") ?? "").trim();
    if (!bookingCode) {
      return NextResponse.json({ success: false, error: "ไม่พบเลขการจอง" }, { status: 400 });
    }

    const { data: booking, error } = await supabaseAdmin
      .from("bookings")
      .select("booking_code, slip_url")
      .eq("booking_code", bookingCode)
      .maybeSingle();

    if (error || !booking) {
      return NextResponse.json({ success: false, error: "ไม่พบข้อมูลการจอง" }, { status: 404 });
    }
    if (!booking.slip_url) {
      return NextResponse.json({ success: false, error: "การจองนี้ยังไม่มีสลิป" }, { status: 404 });
    }

    const { data, error: signedError } = await supabaseAdmin.storage
      .from(BUCKET)
      .createSignedUrl(String(booking.slip_url), 60 * 10);

    if (signedError || !data?.signedUrl) {
      console.error("CREATE SIGNED URL ERROR =", signedError);
      return NextResponse.json({ success: false, error: "ไม่สามารถเปิดสลิปได้" }, { status: 500 });
    }

    return NextResponse.json({ success: true, url: data.signedUrl, bookingCode });
  } catch (error) {
    console.error("BOOKING SLIP GET ERROR =", error);
    return NextResponse.json({ success: false, error: "เกิดข้อผิดพลาดในการเปิดสลิป" }, { status: 500 });
  }
}
