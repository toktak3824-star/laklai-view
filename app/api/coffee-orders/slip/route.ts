import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";

const BUCKET = "payment-slips";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const orderCode = String(
      formData.get("orderCode") || ""
    ).trim();

    const file = formData.get("slip");

    if (!orderCode) {
      return NextResponse.json(
        { error: "ไม่พบเลขคำสั่งซื้อ" },
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

    if (file.size <= 0 || file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          error:
            "ไฟล์สลิปต้องมีขนาดไม่เกิน 10 MB",
        },
        { status: 400 }
      );
    }

    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("coffee_orders")
        .select(
          "id, order_code, payment_status, slip_url"
        )
        .eq("order_code", orderCode)
        .single();

    if (orderError || !order) {
      console.error(
        "ORDER NOT FOUND =",
        orderError
      );

      return NextResponse.json(
        {
          error: "ไม่พบคำสั่งซื้อนี้",
        },
        { status: 404 }
      );
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        {
          error:
            "คำสั่งซื้อนี้ได้รับการยืนยันการชำระเงินแล้ว",
        },
        { status: 409 }
      );
    }

    const extension =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";

    const filePath =
      `orders/${orderCode}/` +
      `${orderCode}-${Date.now()}.${extension}`;

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

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
        "SLIP UPLOAD ERROR =",
        uploadError
      );

      return NextResponse.json(
        {
          error: "อัปโหลดสลิปไม่สำเร็จ",
          detail: uploadError.message,
        },
        { status: 500 }
      );
    }

    const { error: updateError } =
      await supabaseAdmin
        .from("coffee_orders")
        .update({
          slip_url: filePath,
          payment_status:
            "waiting_verification",
        })
        .eq("id", order.id);

    if (updateError) {
      console.error(
        "SLIP DB UPDATE ERROR =",
        updateError
      );

      await supabaseAdmin.storage
        .from(BUCKET)
        .remove([filePath]);

      return NextResponse.json(
        {
          error: "บันทึกสลิปไม่สำเร็จ",
          detail: updateError.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orderCode,
      paymentStatus:
        "waiting_verification",
    });
  } catch (error) {
    console.error(
      "SLIP POST ERROR =",
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


/* =========================================
   GET SLIP
   เปิดสลิปสำหรับผู้ดูแลระบบ
========================================= */

export async function GET(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }


  try {
    const { searchParams } = new URL(req.url);
    const orderCode = String(
      searchParams.get("orderCode") || ""
    ).trim();

    if (!orderCode) {
      return NextResponse.json(
        { error: "ไม่พบเลขคำสั่งซื้อ" },
        { status: 400 }
      );
    }

    console.log("GET SLIP ORDER CODE =", orderCode);

    const { data: order, error: orderError } = await supabaseAdmin
      .from("coffee_orders")
      .select("id, order_code, slip_url")
      .eq("order_code", orderCode)
      .single();

    if (orderError || !order) {
      console.error("ORDER NOT FOUND =", orderError);

      return NextResponse.json(
        { error: "ไม่พบคำสั่งซื้อนี้" },
        { status: 404 }
      );
    }

    if (!order.slip_url) {
      return NextResponse.json(
        { error: "คำสั่งซื้อนี้ยังไม่มีสลิป" },
        { status: 404 }
      );
    }

    const slipPath = String(order.slip_url).trim();

    console.log("SLIP URL FROM DB =", slipPath);

    const fileName = slipPath.split("/").pop();

    if (!fileName) {
      return NextResponse.json(
        { error: "ไม่พบชื่อไฟล์สลิป" },
        { status: 404 }
      );
    }

    console.log("SEARCHING FILE =", fileName);

    // ค้นหาทั้ง 2 bucket ที่มีอยู่จริง
    const buckets = [
      "payment-slips",
      "coffee-slips",
    ];

    // ฟังก์ชันค้นหาไฟล์แบบ recursive
    async function findFile(
      bucket: string,
      folder = ""
    ): Promise<string | null> {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .list(folder, {
          limit: 1000,
          offset: 0,
        });

      if (error || !data) {
        console.log(
          "LIST ERROR",
          bucket,
          folder,
          error
        );
        return null;
      }

      for (const item of data) {
        const currentPath = folder
          ? `${folder}/${item.name}`
          : item.name;

        // เป็นไฟล์
        if (item.id && item.name === fileName) {
          return currentPath;
        }

        // เป็นโฟลเดอร์
        if (!item.id) {
          const found = await findFile(
            bucket,
            currentPath
          );

          if (found) {
            return found;
          }
        }
      }

      return null;
    }

    for (const bucket of buckets) {
      console.log("SEARCH BUCKET =", bucket);

      const foundPath = await findFile(
        bucket
      );

      if (!foundPath) {
        continue;
      }

      console.log(
        "FOUND SLIP =",
        bucket,
        foundPath
      );

      const { data, error } =
        await supabaseAdmin.storage
          .from(bucket)
          .createSignedUrl(foundPath, 60 * 10);

      if (error || !data?.signedUrl) {
        console.error(
          "SIGNED URL ERROR =",
          error
        );

        continue;
      }

      console.log(
        "SIGNED URL CREATED SUCCESSFULLY"
      );

      return NextResponse.json({
        success: true,
        url: data.signedUrl,
        bucket,
        path: foundPath,
      });
    }

    console.error(
      "SLIP FILE NOT FOUND IN ANY BUCKET"
    );

    return NextResponse.json(
      {
        error: "ไม่พบไฟล์สลิปใน Storage",
        fileName,
        databasePath: slipPath,
      },
      { status: 404 }
    );
  } catch (error) {
    console.error(
      "GET SLIP ERROR =",
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