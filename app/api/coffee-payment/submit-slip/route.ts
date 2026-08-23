import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const BUCKET_NAME = "coffee-slips";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export async function POST(req: Request) {
  try {
    // =========================================
    // 1. รับ FormData
    // =========================================

    const formData = await req.formData();

    const orderCodeValue = formData.get("orderCode");
    const slipValue = formData.get("slip");

    if (
      typeof orderCodeValue !== "string" ||
      !orderCodeValue.trim()
    ) {
      return NextResponse.json(
        {
          error: "ไม่พบเลขคำสั่งซื้อ",
        },
        { status: 400 }
      );
    }

    if (!(slipValue instanceof File)) {
      return NextResponse.json(
        {
          error: "กรุณาเลือกไฟล์สลิปการชำระเงิน",
        },
        { status: 400 }
      );
    }

    const orderCode = orderCodeValue.trim();

    // =========================================
    // 2. ตรวจประเภทไฟล์
    // =========================================

    if (!ALLOWED_TYPES.includes(slipValue.type)) {
      return NextResponse.json(
        {
          error:
            "รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP เท่านั้น",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 3. ตรวจขนาดไฟล์
    // =========================================

    if (slipValue.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "ไฟล์สลิปมีขนาดใหญ่เกินไป กรุณาเลือกไฟล์ไม่เกิน 5 MB",
        },
        { status: 400 }
      );
    }

    // =========================================
    // 4. ค้นหา Order
    // =========================================

    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("coffee_orders")
        .select(
          "id, order_code, total_price, payment_status, slip_url"
        )
        .eq("order_code", orderCode)
        .single();

    if (orderError || !order) {
      console.error(
        "COFFEE ORDER NOT FOUND =",
        orderError
      );

      return NextResponse.json(
        {
          error:
            "ไม่พบคำสั่งซื้อนี้ กรุณาตรวจสอบ Order Code",
        },
        { status: 404 }
      );
    }

    // =========================================
    // 5. สร้างชื่อไฟล์
    // =========================================

    let extension = "jpg";

    if (slipValue.type === "image/png") {
      extension = "png";
    }

    if (slipValue.type === "image/webp") {
      extension = "webp";
    }

    const safeOrderCode = orderCode.replace(
      /[^a-zA-Z0-9_-]/g,
      ""
    );

    const fileName =
      `${safeOrderCode}-` +
      `${Date.now()}.` +
      extension;

    const filePath =
      `orders/${safeOrderCode}/${fileName}`;

    // =========================================
    // 6. อัปโหลดสลิปเข้า Supabase Storage
    // =========================================

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(
          filePath,
          slipValue,
          {
            contentType: slipValue.type,
            upsert: false,
          }
        );

    if (uploadError) {
      console.error(
        "COFFEE SLIP UPLOAD ERROR =",
        uploadError
      );

      return NextResponse.json(
        {
          error:
            "ไม่สามารถอัปโหลดสลิปได้",
          detail: uploadError.message,
        },
        { status: 500 }
      );
    }

    // =========================================
    // 7. บันทึกตำแหน่งสลิปลง coffee_orders
    // =========================================

    const { error: updateError } =
      await supabaseAdmin
        .from("coffee_orders")
        .update({
          slip_url: filePath,
          slip_uploaded_at: new Date().toISOString(),
        })
        .eq("id", order.id);

    if (updateError) {
      console.error(
        "COFFEE ORDER UPDATE ERROR =",
        updateError
      );

      // ถ้าบันทึกฐานข้อมูลไม่สำเร็จ
      // ลบไฟล์ที่เพิ่งอัปโหลดออก
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([filePath]);

      return NextResponse.json(
        {
          error:
            "ไม่สามารถบันทึกข้อมูลสลิปได้",
          detail: updateError.message,
        },
        { status: 500 }
      );
    }

    // =========================================
    // 8. สำเร็จ
    // =========================================

    console.log(
      "COFFEE SLIP UPLOADED =",
      {
        orderCode,
        filePath,
      }
    );

    return NextResponse.json(
      {
        success: true,
        orderCode,
        message:
          "ส่งสลิปการชำระเงินเรียบร้อยแล้ว",
      },
      { status: 200 }
    );

  } catch (error) {
    console.error(
      "COFFEE SUBMIT SLIP ERROR =",
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