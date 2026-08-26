import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";

const BUCKET = "payment-slips";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const bookingCode = String(
      formData.get("bookingCode") || ""
    ).trim();

    const file = formData.get("slip");

    if (!bookingCode) {
      return NextResponse.json(
        { error: "ไม่พบเลขการจอง" },
        { status: 400 }
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "กรุณาแนบไฟล์สลิป" },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP",
        },
        { status: 400 }
      );
    }

    if (
      file.size <= 0 ||
      file.size > 10 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error:
            "ไฟล์สลิปต้องมีขนาดไม่เกิน 10 MB",
        },
        { status: 400 }
      );
    }

    // =========================================
    // ค้นหา Booking
    // =========================================

    const { data: booking, error: bookingError } =
      await supabaseAdmin
        .from("bookings")
        .select(
          "id, booking_code, payment_status, slip_url"
        )
        .eq("booking_code", bookingCode)
        .single();

    if (bookingError || !booking) {
      console.error(
        "BOOKING NOT FOUND =",
        bookingError
      );

      return NextResponse.json(
        {
          error: "ไม่พบข้อมูลการจองนี้",
        },
        { status: 404 }
      );
    }

    // =========================================
    // ถ้าชำระเงินแล้ว ไม่รับสลิปใหม่
    // =========================================

    if (booking.payment_status === "paid") {
      return NextResponse.json(
        {
          error:
            "การจองนี้ได้รับการยืนยันการชำระเงินแล้ว",
        },
        { status: 409 }
      );
    }

    // =========================================
    // นามสกุลไฟล์
    // =========================================

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";

    // =========================================
    // Path ใน Private Storage
    // =========================================

    const filePath =
      `bookings/${bookingCode}/` +
      `${bookingCode}-${Date.now()}.${extension}`;

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    // =========================================
    // Upload ไปยัง Private Bucket
    // =========================================

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET)
        .upload(
          filePath,
          buffer,
          {
            contentType: file.type,
            cacheControl: "31536000",
            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "BOOKING SLIP UPLOAD ERROR =",
        uploadError
      );

      return NextResponse.json(
        {
          error:
            "อัปโหลดสลิปไม่สำเร็จ",
          detail: uploadError.message,
        },
        { status: 500 }
      );
    }

    // =========================================
    // บันทึก PATH ลง Database
    // =========================================

    const { error: updateError } =
      await supabaseAdmin
        .from("bookings")
        .update({
          slip_url: filePath,
          payment_status:
            "waiting_verification",
        })
        .eq("id", booking.id);

    if (updateError) {
      console.error(
        "BOOKING SLIP DB UPDATE ERROR =",
        updateError
      );

      // ถ้า DB บันทึกไม่ได้ ลบไฟล์ทิ้ง
      await supabaseAdmin.storage
        .from(BUCKET)
        .remove([filePath]);

      return NextResponse.json(
        {
          error:
            "บันทึกข้อมูลสลิปไม่สำเร็จ",
          detail: updateError.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "BOOKING SLIP UPLOADED =",
      bookingCode,
      filePath
    );

    return NextResponse.json({
      success: true,
      bookingCode,
      paymentStatus:
        "waiting_verification",
    });
  } catch (error) {
    console.error(
      "BOOKING SLIP POST ERROR =",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการส่งสลิป",
      },
      { status: 500 }
    );
  }
}


// =====================================================
// GET — เปิดดูสลิปสำหรับ ADMIN เท่านั้น
// =====================================================

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      {
        error: "ไม่มีสิทธิ์เข้าถึง",
      },
      { status: 401 }
    );
  }

  try {
    const { searchParams } =
      new URL(req.url);

    const bookingCode = String(
      searchParams.get("bookingCode") || ""
    ).trim();

    if (!bookingCode) {
      return NextResponse.json(
        {
          error: "ไม่พบเลขการจอง",
        },
        { status: 400 }
      );
    }

    const { data: booking, error } =
      await supabaseAdmin
        .from("bookings")
        .select(
          "id, booking_code, slip_url"
        )
        .eq("booking_code", bookingCode)
        .single();

    if (error || !booking) {
      return NextResponse.json(
        {
          error: "ไม่พบข้อมูลการจอง",
        },
        { status: 404 }
      );
    }

    if (!booking.slip_url) {
      return NextResponse.json(
        {
          error:
            "การจองนี้ยังไม่มีสลิป",
        },
        { status: 404 }
      );
    }

    const slipPath = String(
      booking.slip_url
    ).trim();

    const { data, error: signedError } =
      await supabaseAdmin.storage
        .from(BUCKET)
        .createSignedUrl(
          slipPath,
          60 * 10
        );

    if (
      signedError ||
      !data?.signedUrl
    ) {
      console.error(
        "CREATE SIGNED URL ERROR =",
        signedError
      );

      return NextResponse.json(
        {
          error:
            "ไม่สามารถเปิดสลิปได้",
          detail:
            signedError?.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      url: data.signedUrl,
      bookingCode,
    });
  } catch (error) {
    console.error(
      "BOOKING SLIP GET ERROR =",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการเปิดสลิป",
      },
      { status: 500 }
    );
  }
}