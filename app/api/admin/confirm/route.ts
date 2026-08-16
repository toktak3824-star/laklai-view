import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        {
          error: "ไม่พบรหัสการจอง",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 1. ดึงข้อมูลการจอง
    // =========================================

    const { data: booking, error: bookingError } =
      await supabaseAdmin
        .from("bookings")
        .select("*")
        .eq("id", id)
        .single();

    if (bookingError || !booking) {
      console.error(
        "BOOKING NOT FOUND =",
        bookingError
      );

      return NextResponse.json(
        {
          error: "ไม่พบข้อมูลการจอง",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "กำลังยืนยันการจอง =",
      booking.booking_code
    );

    console.log(
      "อีเมลลูกค้า =",
      booking.email
    );

    // =========================================
    // 2. ตรวจสอบสถานะ
    // =========================================

    if (booking.booking_status === "cancelled") {
      return NextResponse.json(
        {
          error: "รายการจองนี้ถูกยกเลิกไปแล้ว",
        },
        {
          status: 400,
        }
      );
    }

    if (booking.booking_status === "confirmed") {
      return NextResponse.json(
        {
          error: "รายการจองนี้ได้รับการยืนยันแล้ว",
        },
        {
          status: 400,
        }
      );
    }

    if (!booking.email) {
      return NextResponse.json(
        {
          error: "ไม่พบอีเมลของลูกค้า",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 3. เปลี่ยนสถานะการจอง
    // =========================================

    const { error: updateError } = await supabaseAdmin
      .from("bookings")
      .update({
        booking_status: "confirmed",
        payment_status: "paid",
      })
      .eq("id", id);

    if (updateError) {
      console.error(
        "UPDATE BOOKING ERROR =",
        updateError
      );

      throw updateError;
    }

    console.log(
      "เปลี่ยนสถานะเป็น confirmed สำเร็จ"
    );

    // =========================================
    // 4. ส่งอีเมลยืนยันให้ลูกค้า
    // =========================================

    const { data: emailData, error: emailError } =
      await resend.emails.send({
        from: "Laklai View <booking@laklaiview.com>",

        to: booking.email,

        subject:
          `ยืนยันการจอง Laklai View ${booking.booking_code}`,

        html: `
          <div
            style="
              font-family: Arial, sans-serif;
              max-width: 680px;
              margin: 0 auto;
              padding: 30px;
              color: #292524;
              line-height: 1.8;
            "
          >

            <div
              style="
                background: #047857;
                color: white;
                padding: 30px;
                border-radius: 18px;
                text-align: center;
              "
            >
              <h1 style="margin: 0;">
                Laklai View
              </h1>

              <p style="margin-bottom: 0;">
                ยืนยันการจองเรียบร้อยแล้ว
              </p>
            </div>


            <div
              style="
                background: #f5f5f4;
                margin-top: 20px;
                padding: 25px;
                border-radius: 18px;
              "
            >

              <h2>
                ขอบคุณสำหรับการจอง
              </h2>

              <p>
                สวัสดี คุณ
                <strong>
                  ${booking.guest_name}
                </strong>
              </p>

              <p>
                ทาง หลักลาย View Laklai View
                ได้ตรวจสอบหลักฐานการชำระเงินของคุณเรียบร้อยแล้ว
                และยืนยันการจองของคุณเรียบร้อยแล้ว
              </p>

              <hr />

              <h3>
                รายละเอียดการจอง
              </h3>

              <p>
                <strong>เลขที่การจอง:</strong>
                ${booking.booking_code}
              </p>

              <p>
                <strong>บ้านพัก:</strong>
                ${
  booking.room_id === "house1"
    ? "บ้านสวนวิถี"
    : booking.room_id === "house2"
    ? "บ้านพักใจ"
    : booking.room_id === "house3"
    ? "บ้านแสงดาว"
    : booking.room_id === "house4"
    ? "บ้านสุขใจ"
    : booking.room_id
}
              </p>

              <p>
                <strong>เช็คอิน:</strong>
                ${booking.check_in}
              </p>

              <p>
                <strong>เช็คเอาท์:</strong>
                ${booking.check_out}
              </p>

              <p>
                <strong>ผู้เข้าพัก:</strong>
                ผู้ใหญ่ ${booking.adults ?? 0} คน
                เด็ก ${booking.children ?? 0} คน
              </p>

              <p>
                <strong>ยอดชำระ:</strong>
                ฿${Number(
                  booking.total_price
                ).toLocaleString("th-TH")}
              </p>

              <hr />

              <div
                style="
                  background: #dcfce7;
                  color: #166534;
                  padding: 18px;
                  border-radius: 12px;
                  text-align: center;
                "
              >
                <strong>
                  ✓ การจองของคุณได้รับการยืนยันแล้ว
                </strong>
              </div>

              <h3>
                เวลาเข้าพัก
              </h3>

              <p>
                <strong>Check-in:</strong>
                14:00 น.
              </p>

              <p>
                <strong>Check-out:</strong>
                11:45 น.
              </p>

              <p>
                กรุณาเก็บอีเมลฉบับนี้ไว้
                เพื่อใช้เป็นหลักฐานการจองเมื่อเข้าพัก
              </p>

              <br />

              <p>
                หากมีข้อสงสัยหรือต้องการสอบถามข้อมูลเพิ่มเติม
                สามารถติดต่อ หลักลายวิว Laklai View ได้โดยตรงจากช่องทาง
                เพจ Fecebook "หลักลาย View" หรือเบอร์โทรศัพท์ 083-156-5478,064-470-9898
              </p>

              <p>
                ขอบคุณที่เลือกพักกับ
                <strong>
                  Laklai View หลักลายวิว ❤️
                </strong>
              </p>

            </div>

          </div>
        `,
      });

    // =========================================
    // 5. ตรวจสอบผลการส่งอีเมล
    // =========================================

    if (emailError) {
      console.error(
        "CONFIRM EMAIL ERROR =",
        emailError
      );

      return NextResponse.json(
        {
          error:
            "ยืนยันการจองสำเร็จ แต่ไม่สามารถส่งอีเมลได้",
          detail: emailError,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "ส่งอีเมลยืนยันสำเร็จ =",
      emailData
    );

    // =========================================
    // 6. ส่งผลกลับไปยังหน้า Admin
    // =========================================

    return NextResponse.json({
      success: true,
      message:
        "ยืนยันการจองและส่งอีเมลให้ลูกค้าเรียบร้อยแล้ว",
      bookingCode: booking.booking_code,
    });

  } catch (err) {
    console.error(
      "CONFIRM BOOKING ERROR =",
      err
    );

    return NextResponse.json(
      {
        error: "ไม่สามารถยืนยันการจองได้",
        detail: String(err),
      },
      {
        status: 500,
      }
    );
  }
}