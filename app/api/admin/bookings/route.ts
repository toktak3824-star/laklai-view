import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";

const BUCKET = "payment-slips";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "ไม่มีสิทธิ์เข้าถึง" },
      { status: 401 }
    );
  }

  try {
    const { data, error } = await supabaseAdmin
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("ADMIN BOOKINGS ERROR =", error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    /*
      สร้าง Signed URL สำหรับสลิป
      เพื่อให้ Admin สามารถกด "ดูสลิป"
      ได้จากทั้งคอมพิวเตอร์และมือถือ
    */
    const bookingsWithSlipUrl = await Promise.all(
      (data ?? []).map(async (booking) => {
        if (!booking.slip_url) {
          return booking;
        }

        const slipPath = String(booking.slip_url).trim();

        /*
          ถ้าในฐานข้อมูลเป็น URL เต็มอยู่แล้ว
          ไม่ต้องสร้าง Signed URL ซ้ำ
        */
        if (
          slipPath.startsWith("http://") ||
          slipPath.startsWith("https://")
        ) {
          return {
            ...booking,
            slip_url: slipPath,
          };
        }

        /*
          ถ้าเป็น path ของไฟล์ใน Storage
          ให้สร้าง Signed URL สำหรับ Admin
        */
        const { data: signedData, error: signedError } =
          await supabaseAdmin.storage
            .from(BUCKET)
            .createSignedUrl(
              slipPath,
              60 * 10
            );

        if (signedError || !signedData?.signedUrl) {
          console.error(
            "CREATE BOOKING SLIP SIGNED URL ERROR =",
            signedError
          );

          /*
            ถ้าสร้าง Signed URL ไม่สำเร็จ
            ให้คงค่าเดิมไว้ก่อน
            เพื่อไม่ให้รายการจองหาย
          */
          return {
            ...booking,
            slip_url: slipPath,
          };
        }

        return {
          ...booking,
          slip_url: signedData.signedUrl,
        };
      })
    );

    return NextResponse.json(
      bookingsWithSlipUrl
    );
  } catch (err) {
    console.error(
      "ADMIN BOOKINGS SERVER ERROR =",
      err
    );

    return NextResponse.json(
      { error: "Server Error" },
      { status: 500 }
    );
  }
}