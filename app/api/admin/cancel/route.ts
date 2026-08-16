import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { id, reason } = await req.json();

    // =========================================
    // 1. ตรวจสอบข้อมูล
    // =========================================

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

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        {
          error: "กรุณาระบุเหตุผลในการยกเลิกการจอง",
        },
        {
          status: 400,
        }
      );
    }

    const cancellationReason = reason.trim();

    // =========================================
    // 2. ดึงข้อมูลการจอง
    // =========================================

    const {
      data: booking,
      error: bookingError,
    } = await supabaseAdmin
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
      "กำลังยกเลิกการจอง =",
      booking.booking_code
    );

    console.log(
      "เหตุผลการยกเลิก =",
      cancellationReason
    );

    console.log(
      "อีเมลลูกค้า =",
      booking.email
    );

    // =========================================
    // 3. ตรวจสอบสถานะ
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
    // 4. เปลี่ยนสถานะ + บันทึกเหตุผล
    // =========================================

    const {
      error: updateError,
    } = await supabaseAdmin
      .from("bookings")
      .update({
        booking_status: "cancelled",
        cancellation_reason: cancellationReason,
      })
      .eq("id", id);

    if (updateError) {
      console.error(
        "UPDATE CANCEL ERROR =",
        updateError
      );

      throw updateError;
    }

    console.log(
      "เปลี่ยนสถานะเป็น cancelled สำเร็จ"
    );

    console.log(
      "บันทึกเหตุผลการยกเลิกสำเร็จ"
    );

    // =========================================
    // 5. แปลงชื่อบ้านพัก
    // =========================================

    const roomName =
      booking.room_id === "house1"
        ? "บ้านสวนวิถี"
        : booking.room_id === "house2"
        ? "บ้านพักใจ"
        : booking.room_id === "house3"
        ? "บ้านแสงดาว"
        : booking.room_id === "house4"
        ? "บ้านสุขใจ"
        : booking.room_id;

    // =========================================
    // 6. ส่งอีเมลแจ้งลูกค้า
    // =========================================

    const {
      data: emailData,
      error: emailError,
    } = await resend.emails.send({
      from: "Laklai View <booking@laklaiview.com>",

      to: booking.email,

      subject:
        `แจ้งยกเลิกการจอง Laklai View ${booking.booking_code}`,

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

          <!-- HEADER -->

          <div
            style="
              background: #991b1b;
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
              แจ้งสถานะการจอง
            </p>

          </div>


          <!-- CONTENT -->

          <div
            style="
              background: #f5f5f4;
              margin-top: 20px;
              padding: 25px;
              border-radius: 18px;
            "
          >

            <h2>
              แจ้งยกเลิกการจอง
            </h2>

            <p>
              สวัสดี คุณ
              <strong>
                ${booking.guest_name}
              </strong>
            </p>

            <p>
              ทาง หลักลาย View Laklai View
              ขอแจ้งให้ทราบว่า
              การจองของคุณถูกยกเลิกแล้ว
            </p>

            <hr />

            <h3>
              รายละเอียดการจอง
            </h3>

            <p>
              <strong>
                เลขที่การจอง:
              </strong>
              ${booking.booking_code}
            </p>

            <p>
              <strong>
                บ้านพัก:
              </strong>
              ${roomName}
            </p>

            <p>
              <strong>
                เช็คอิน:
              </strong>
              ${booking.check_in}
            </p>

            <p>
              <strong>
                เช็คเอาท์:
              </strong>
              ${booking.check_out}
            </p>

            <p>
              <strong>
                ผู้เข้าพัก:
              </strong>
              ผู้ใหญ่ ${booking.adults ?? 0} คน
              เด็ก ${booking.children ?? 0} คน
            </p>

            <p>
              <strong>
                ยอดการจอง:
              </strong>
              ฿${Number(
                booking.total_price
              ).toLocaleString("th-TH")}
            </p>

            <hr />

            <!-- CANCEL REASON -->

            <div
              style="
                background: #fff7ed;
                border: 1px solid #fed7aa;
                color: #9a3412;
                padding: 20px;
                border-radius: 12px;
                margin-top: 20px;
              "
            >

              <h3 style="margin-top: 0;">
                เหตุผลในการยกเลิก
              </h3>

              <p
                style="
                  margin-bottom: 0;
                  white-space: pre-line;
                "
              >
                ${cancellationReason}
              </p>

            </div>


            <!-- CANCEL STATUS -->

            <div
              style="
                background: #fee2e2;
                color: #991b1b;
                padding: 18px;
                border-radius: 12px;
                text-align: center;
                margin-top: 20px;
              "
            >

              <strong>
                ✕ การจองนี้ถูกยกเลิกแล้ว
              </strong>

            </div>


            <h3>
              เวลาเข้าพัก
            </h3>

            <p>
              <strong>
                Check-in:
              </strong>
              14:00 น.
            </p>

            <p>
              <strong>
                Check-out:
              </strong>
              11:45 น.
            </p>


            <p>
              หากมีข้อสงสัย
              หรือต้องการสอบถามข้อมูลเพิ่มเติม
              สามารถติดต่อ หลักลายวิว Laklai View
              ได้โดยตรง
            </p>


            <p>
              ติดต่อผ่านเพจ Facebook
              "หลักลาย View"
              หรือโทรศัพท์
              083-156-5478,
              064-470-9898
            </p>


            <br />

            <p>
              ขอบคุณที่ติดต่อและเลือกพักกับ
              <strong>
                Laklai View หลักลายวิว ❤️
              </strong>
            </p>

          </div>

        </div>
      `,
    });

    // =========================================
    // 7. ตรวจสอบผลการส่งอีเมล
    // =========================================

    if (emailError) {
      console.error(
        "CANCEL EMAIL ERROR =",
        emailError
      );

      return NextResponse.json(
        {
          error:
            "ยกเลิกการจองสำเร็จ แต่ไม่สามารถส่งอีเมลได้",
          detail: emailError,
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "ส่งอีเมลยกเลิกสำเร็จ =",
      emailData
    );

    // =========================================
    // 8. ส่งผลกลับไปหน้า Admin
    // =========================================

    return NextResponse.json({
      success: true,

      message:
        "ยกเลิกการจองและส่งอีเมลให้ลูกค้าเรียบร้อยแล้ว",

      bookingCode:
        booking.booking_code,

      cancellationReason,
    });

  } catch (err) {

    console.error(
      "CANCEL BOOKING ERROR =",
      err
    );

    return NextResponse.json(
      {
        error:
          "ไม่สามารถยกเลิกการจองได้",

        detail:
          String(err),
      },
      {
        status: 500,
      }
    );
  }
}