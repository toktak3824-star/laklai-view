import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const {
      email,
      guestName,
      roomName,
      checkIn,
      checkOut,
      totalPrice,
      bookingCode,
      slipUrl,

      // =========================================
      // ข้อมูลผู้เข้าพัก
      // =========================================
      adults,
      childAges,
    } = await req.json();

    const customerEmailAddress = String(email ?? "").trim();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmailAddress)) {
  return NextResponse.json(
    {
      error: "Invalid customer email",
    },
    {
      status: 400,
    }
  );
}
    // =========================================
    // จัดข้อมูลผู้เข้าพัก
    // =========================================

    const adultCount = Number(adults ?? 0);

    const ages: number[] = Array.isArray(childAges)
      ? childAges.map(Number)
      : [];

    // เด็ก 0-8 ปี
    const youngChildren = ages.filter(
      (age) => age >= 0 && age <= 8
    );

    // เด็ก 9-13 ปี
    const olderChildren = ages.filter(
      (age) => age >= 9 && age <= 13
    );

    // อายุ 14 ปีขึ้นไป
    // ถือเป็นผู้ใหญ่
    const adultChildren = ages.filter(
      (age) => age >= 14
    );

    const effectiveAdults =
      adultCount + adultChildren.length;

    const totalGuests =
      adultCount + ages.length;

    // =========================================
    // ตรวจว่าต้องเตรียมที่นอนเสริมหรือไม่
    // =========================================

    const needsExtraBed =
      adultCount >= 3 ||
      olderChildren.length > 0 ||
      youngChildren.length >= 2;

    // =========================================
    // สร้างข้อความรายละเอียดผู้เข้าพัก
    // =========================================

    const childAgeText =
      ages.length > 0
        ? ages.join(", ") + " ปี"
        : "ไม่มี";

    const youngChildrenText =
      youngChildren.length > 0
        ? `${youngChildren.length} คน — ไม่มีค่าใช้จ่าย`
        : "0 คน";

    const olderChildrenText =
      olderChildren.length > 0
        ? `${olderChildren.length} คน — 350 บาท/คน`
        : "0 คน";

    const adultChildrenText =
      adultChildren.length > 0
        ? `${adultChildren.length} คน — คิดเป็นผู้ใหญ่`
        : "0 คน";

    const extraBedText = needsExtraBed
      ? "🛏️ ต้องเตรียมที่นอนเสริม"
      : "ไม่ต้องเตรียมที่นอนเสริม";

    // =========================================
    // ลิงก์สำหรับ ADMIN
    // =========================================
    const adminUrl =
      "https://laklaiview.com/admin/bookings";

    const paymentUrl =
      `https://laklaiview.com/payment/${encodeURIComponent(
        String(bookingCode ?? "")
      )}`;

    const cleanSlipUrl = String(slipUrl ?? "").trim();

    const slipButton = cleanSlipUrl
      ? `
        <a
          href="${cleanSlipUrl}"
          target="_blank"
          rel="noopener noreferrer"
          style="
            display:inline-block;
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            padding:14px 22px;
            border-radius:10px;
            font-weight:bold;
            margin:6px;
          "
        >
          🔎 ดูสลิป
        </a>
      `
      : "";

    // =========================================
    // 1. ส่งอีเมลให้ลูกค้า
    // =========================================

    const { data: customerEmail, error: customerEmailError } =
      await resend.emails.send({
        from: "Laklai View <booking@laklaiview.com>",

        to: customerEmailAddress,

        subject: "ยืนยันการได้รับคำขอจอง Laklai View",

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.7;">

            <h2>ขอบคุณสำหรับการจอง Laklai View</h2>

            <p>
              สวัสดี คุณ <b>${guestName}</b>
            </p>

            <p>
              เราได้รับคำขอจองของคุณเรียบร้อยแล้ว
            </p>

            <hr/>

            <h3>รายละเอียดการจอง</h3>

            <p>
              <b>เลขที่การจอง</b> :
              ${bookingCode}
            </p>

            <p>
              <b>บ้านพัก</b> :
              ${roomName}
            </p>

            <p>
              <b>เช็คอิน</b> :
              ${checkIn}
            </p>

            <p>
              <b>เช็คเอาท์</b> :
              ${checkOut}
            </p>

            <hr/>

            <h3>รายละเอียดผู้เข้าพัก</h3>

            <p>
              👨 <b>ผู้ใหญ่</b> :
              ${effectiveAdults} คน
            </p>

            <p>
              👶 <b>เด็กทั้งหมด</b> :
              ${ages.length} คน
            </p>

            <p>
              <b>อายุเด็ก</b> :
              ${childAgeText}
            </p>

            <p>
              🟢 <b>เด็ก 0-8 ปี</b> :
              ${youngChildrenText}
            </p>

            <p>
              🟠 <b>เด็ก 9-13 ปี</b> :
              ${olderChildrenText}
            </p>

            <p>
              🔴 <b>อายุ 14 ปีขึ้นไป</b> :
              ${adultChildrenText}
            </p>

            <p>
              👥 <b>ผู้เข้าพักทั้งหมด</b> :
              ${totalGuests} คน
            </p>

            <p>
              ${extraBedText}
            </p>

            <hr/>

            <h3>
              ยอดชำระ
            </h3>

            <p style="font-size: 20px;">
              <b>
                ฿${Number(totalPrice).toLocaleString()}
              </b>
            </p>

            <p>
              ขณะนี้สถานะการจองคือ
            </p>

            <h3>
              รอตรวจสอบสลิปการโอน
            </h3>

            <p>
              เมื่อแอดมินตรวจสอบเรียบร้อยแล้ว
              ระบบจะส่งอีเมลยืนยันการจองให้อัตโนมัติ
            </p>

            <br/>

            <p>
              ขอบคุณที่เลือกพักกับ
              <b>Laklai View หลักลายวิว</b> ❤️
            </p>

          </div>
        `,
      });

    console.log(
      "CUSTOMER EMAIL RESULT =",
      customerEmail
    );

    console.log(
      "CUSTOMER EMAIL ERROR =",
      customerEmailError
    );

    if (customerEmailError) {
      throw customerEmailError;
    }

    // =========================================
    // 2. ส่งอีเมลให้ ADMIN
    // =========================================

    const {
      data: adminEmail,
      error: adminEmailError,
    } = await resend.emails.send({
      from: "Laklai View <booking@laklaiview.com>",

      to: "toktak3824@gmail.com",

      subject:
        `🔔 มีคำขอจองใหม่ ${bookingCode} — ${roomName}`,

      html: `
        <div
          style="
            font-family: Arial, sans-serif;
            line-height: 1.7;
            color: #222;
          "
        >

          <h2>
            🔔 มีคำขอจองใหม่
          </h2>

          <p>
            กรุณาตรวจสอบข้อมูลลูกค้าก่อนอนุมัติการจอง
          </p>

          <hr/>

          <h3>
            📋 ข้อมูลการจอง
          </h3>

          <p>
            <b>เลขที่การจอง</b> :
            ${bookingCode}
          </p>

          <p>
            <b>ชื่อผู้จอง</b> :
            ${guestName}
          </p>

          <p>
            <b>อีเมล</b> :
            ${email}
          </p>

          <p>
            <b>บ้านพัก</b> :
            ${roomName}
          </p>

          <p>
            <b>เช็คอิน</b> :
            ${checkIn}
          </p>

          <p>
            <b>เช็คเอาท์</b> :
            ${checkOut}
          </p>

          <hr/>

          <h3>
            👥 รายละเอียดผู้เข้าพัก
          </h3>

          <p style="font-size: 18px;">
            👨 <b>ผู้ใหญ่ :</b>
            ${effectiveAdults} คน
          </p>

          <p style="font-size: 18px;">
            👶 <b>เด็ก :</b>
            ${ages.length} คน
          </p>

          <div
            style="
              background: #f5f5f5;
              padding: 15px;
              border-radius: 10px;
            "
          >

            <p>
              <b>อายุเด็ก:</b>
              ${childAgeText}
            </p>

            <p style="color: #16803c;">
              🟢 เด็ก 0-8 ปี:
              ${youngChildrenText}
            </p>

            <p style="color: #c25b00;">
              🟠 เด็ก 9-13 ปี:
              ${olderChildrenText}
            </p>

            <p style="color: #b00020;">
              🔴 อายุ 14 ปีขึ้นไป:
              ${adultChildrenText}
            </p>

          </div>

          <p style="font-size: 18px;">
            👥 <b>รวมผู้เข้าพักทั้งหมด:</b>
            ${totalGuests} คน
          </p>

          <div
            style="
              background: ${
                needsExtraBed
                  ? "#fff4cc"
                  : "#eaf8ee"
              };
              padding: 15px;
              border-radius: 10px;
              margin-top: 15px;
            "
          >

            <p style="font-size: 18px; margin: 0;">
              ${extraBedText}
            </p>

          </div>

          <hr/>

          <h3>
            💰 การชำระเงิน
          </h3>

          <p style="font-size: 22px;">
            <b>
              ฿${Number(totalPrice).toLocaleString()}
            </b>
          </p>

          <hr/>

          <h3>
            ⚠️ กรุณาตรวจสอบก่อนอนุมัติ
          </h3>

          <ul>
            <li>
              ตรวจสอบจำนวนผู้เข้าพัก
            </li>

            <li>
              ตรวจสอบอายุเด็ก
            </li>

            <li>
              ตรวจสอบยอดเงิน
            </li>

            <li>
              ตรวจสอบหลักฐานการโอนเงิน
            </li>

            <li>
              เตรียมที่นอนเสริมหากจำเป็น
            </li>
          </ul>

          <p>
            กรุณาตรวจสอบข้อมูลการจองและหลักฐานการชำระเงิน
            ก่อนอนุมัติหรือยกเลิกการจอง
          </p>

          <div
            style="
              margin-top:25px;
              padding:18px;
              background:#f7f7f5;
              border-radius:12px;
              text-align:center;
            "
          >
            ${slipButton}

            <a
              href="${adminUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display:inline-block;
                background:#166534;
                color:#ffffff;
                text-decoration:none;
                padding:14px 22px;
                border-radius:10px;
                font-weight:bold;
                margin:6px;
              "
            >
              🏠 เปิดระบบหลังบ้าน
            </a>

            <a
              href="${paymentUrl}"
              target="_blank"
              rel="noopener noreferrer"
              style="
                display:inline-block;
                background:#3f4a38;
                color:#ffffff;
                text-decoration:none;
                padding:14px 22px;
                border-radius:10px;
                font-weight:bold;
                margin:6px;
              "
            >
              💳 เปิดหน้าชำระเงิน
            </a>
          </div>

          ${
            cleanSlipUrl
              ? `<p style="margin-top:15px;color:#555;">
                  มีสลิปแนบมาแล้ว สามารถกด “🔎 ดูสลิป” เพื่อตรวจสอบได้ทันที
                </p>`
              : `<p style="margin-top:15px;color:#777;">
                  ขณะนี้ยังไม่มีสลิปแนบมา
                  หากลูกค้ายังไม่ได้อัปโหลด ให้รอตรวจสอบอีกครั้งหลังลูกค้าแนบหลักฐาน
                </p>`
          }

        </div>
      `,
    });

    console.log(
      "ADMIN EMAIL RESULT =",
      adminEmail
    );

    console.log(
      "ADMIN EMAIL ERROR =",
      adminEmailError
    );

    if (adminEmailError) {
      throw adminEmailError;
    }

    // =========================================
    // สำเร็จ
    // =========================================

    return NextResponse.json({
      success: true,
    });

  } catch (err) {

    console.error(
      "SEND EMAIL ERROR =",
      err
    );

    return NextResponse.json(
      {
        error: "Email failed",
        detail: String(err),
      },
      {
        status: 500,
      }
    );
  }
}