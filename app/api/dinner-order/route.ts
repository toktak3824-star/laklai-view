import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { DINNER_MENU } from "@/data/dinnerMenu";
import { Resend } from "resend";

export const runtime = "nodejs";

const ADMIN_EMAIL = "toktak3824@gmail.com";

const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "Laklai View <booking@laklaiview.com>";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type SavedDinnerItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type BookingRecord = {
  id: string;
  booking_code: string;
  guest_name: string;
  email: string;
  phone: string;
  check_in: string;
  check_out: string;
  room_id: string;
  booking_status: string;
  nature_experience_selected: boolean;
  dinner_items: SavedDinnerItem[] | null;
  dinner_total: number | string | null;
};

function normalizeEmail(value: unknown): string {
  return String(value ?? "").trim().toLowerCase();
}

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };

    return map[char];
  });
}

function money(value: number): string {
  return value.toLocaleString("th-TH");
}

// =====================================
// วันที่ปัจจุบันตามประเทศไทย
// =====================================

function getThailandDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = parts.find(
    (item) => item.type === "year"
  )?.value;

  const month = parts.find(
    (item) => item.type === "month"
  )?.value;

  const day = parts.find(
    (item) => item.type === "day"
  )?.value;

  return `${year}-${month}-${day}`;
}

function getMinimumOrderDate(): string {
  const today = getThailandDate();

  const date = new Date(
    `${today}T00:00:00+07:00`
  );

  date.setDate(date.getDate() + 1);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find(
    (item) => item.type === "year"
  )?.value;

  const month = parts.find(
    (item) => item.type === "month"
  )?.value;

  const day = parts.find(
    (item) => item.type === "day"
  )?.value;

  return `${year}-${month}-${day}`;
}

// =====================================
// ค้นหา Booking จาก Booking Code
// =====================================

async function findBooking(
  bookingCode: string,
  email: string
): Promise<BookingRecord | null> {
  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(`
      id,
      booking_code,
      guest_name,
      email,
      phone,
      check_in,
      check_out,
      room_id,
      booking_status,
      nature_experience_selected,
      dinner_items,
      dinner_total
    `)
    .eq("booking_code", bookingCode)
    .maybeSingle();

  if (error) {
    console.error(
      "DINNER BOOKING LOOKUP ERROR:",
      error
    );

    throw new Error(
      "ไม่สามารถตรวจสอบข้อมูลการจองได้"
    );
  }

  if (!data) {
    return null;
  }

  if (normalizeEmail(data.email) !== email) {
    return null;
  }

  // อนุญาตเฉพาะการจองที่ยังดำเนินการอยู่
  if (
    data.booking_status !== "pending" &&
    data.booking_status !== "confirmed"
  ) {
    return null;
  }

  return data as BookingRecord;
}

// =====================================
// แจ้งอีเมลแอดมิน
// =====================================

async function notifyAdminDinnerOrder(
  booking: {
    booking_code: string;
    guest_name: string;
    email: string;
    phone: string;
    check_in: string;
    check_out: string;
    room_id: string;
  },
  dinnerItems: SavedDinnerItem[],
  dinnerTotal: number
): Promise<boolean> {
  // ไม่มีรายการอาหาร ไม่ส่งอีเมล
  if (dinnerItems.length === 0) {
    return false;
  }

  if (!resend) {
    console.error(
      "DINNER EMAIL ERROR: RESEND_API_KEY is missing"
    );

    return false;
  }

  const rows = dinnerItems
    .map((item) => {
      const subtotal = item.price * item.quantity;

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">
            ${escapeHtml(item.name)}
          </td>

          <td style="padding:10px;text-align:center;border-bottom:1px solid #eee;">
            ${item.quantity}
          </td>

          <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">
            ${money(item.price)} บาท
          </td>

          <td style="padding:10px;text-align:right;border-bottom:1px solid #eee;">
            ${money(subtotal)} บาท
          </td>
        </tr>
      `;
    })
    .join("");

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,

      subject: `🍽️ รายการอาหารใหม่ ${booking.booking_code}`,

      html: `
        <div style="
          font-family:Arial,sans-serif;
          line-height:1.8;
          color:#292524;
          max-width:720px;
          margin:auto;
          padding:20px;
        ">

          <h2 style="color:#166534;">
            มีการบันทึกรายการอาหารใหม่
          </h2>

          <p>
            ลูกค้าได้บันทึกหรือปรับปรุงรายการอาหาร
            สำหรับการจองของหลักลายวิว
          </p>

          <div style="
            background:#f5f5f4;
            padding:16px;
            border-radius:12px;
          ">

            <p>
              <strong>Booking Code:</strong>
              ${escapeHtml(booking.booking_code)}
            </p>

            <p>
              <strong>ชื่อผู้จอง:</strong>
              ${escapeHtml(booking.guest_name)}
            </p>

            <p>
              <strong>อีเมล:</strong>
              ${escapeHtml(booking.email)}
            </p>

            <p>
              <strong>เบอร์โทร:</strong>
              ${escapeHtml(booking.phone)}
            </p>

            <p>
              <strong>บ้านพัก:</strong>
              ${escapeHtml(booking.room_id)}
            </p>

            <p>
              <strong>วันเข้าพัก:</strong>
              ${escapeHtml(booking.check_in)}
            </p>

            <p>
              <strong>วันออก:</strong>
              ${escapeHtml(booking.check_out)}
            </p>

          </div>

          <h3 style="color:#9a3412;margin-top:24px;">
            รายการอาหารเย็น
          </h3>

          <table style="
            width:100%;
            border-collapse:collapse;
            font-size:14px;
          ">

            <thead>
              <tr style="background:#f5f5f4;">
                <th style="padding:10px;text-align:left;">
                  รายการ
                </th>

                <th style="padding:10px;text-align:center;">
                  จำนวน
                </th>

                <th style="padding:10px;text-align:right;">
                  ราคาต่อหน่วย
                </th>

                <th style="padding:10px;text-align:right;">
                  รวม
                </th>
              </tr>
            </thead>

            <tbody>
              ${rows}
            </tbody>

          </table>

          <div style="
            margin-top:20px;
            padding:16px;
            background:#fff7ed;
            border-radius:12px;
            text-align:right;
          ">

            <strong>
              รวมค่าอาหารเย็น:
              ${money(dinnerTotal)} บาท
            </strong>

          </div>

          <p style="color:#9a3412;font-size:13px;">
            หมายเหตุ: ค่าอาหารเย็นแยกจากค่าที่พักและกิจกรรม
            ลูกค้าชำระค่าอาหารในวันเช็กอิน
          </p>

          <p style="margin-top:24px;">
            <a
              href="https://laklaiview.com/admin/bookings"
              style="
                display:inline-block;
                padding:12px 22px;
                background:#047857;
                color:white;
                text-decoration:none;
                border-radius:8px;
              "
            >
              เปิดระบบหลังบ้าน
            </a>
          </p>

          <p style="color:#78716c;font-size:12px;">
            Laklai View — หลักลาย view วิถีบ้านป่า
          </p>

        </div>
      `,
    });

    if (error) {
      console.error(
        "DINNER ADMIN EMAIL ERROR:",
        error
      );

      return false;
    }

    return true;

  } catch (error) {
    console.error(
      "DINNER ADMIN EMAIL ERROR:",
      error
    );

    return false;
  }
}

// =====================================
// POST
// =====================================

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const action = String(
      body.action ?? ""
    ).trim();

    const bookingCode = String(
      body.booking_code ?? ""
    ).trim();

    const email = normalizeEmail(body.email);

    // =====================================
    // 1. ตรวจสอบข้อมูล
    // =====================================

    if (!bookingCode || !email) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณากรอก Booking Code และอีเมล",
        },
        { status: 400 }
      );
    }

    if (
      bookingCode.length > 60 ||
      email.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "กรุณาตรวจสอบ Booking Code และอีเมล",
        },
        { status: 400 }
      );
    }

    if (
      action !== "verify" &&
      action !== "save"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "ไม่พบคำสั่งที่ถูกต้อง",
        },
        { status: 400 }
      );
    }

    // =====================================
    // 2. ตรวจสอบ Booking เดิม
    // =====================================

    const booking = await findBooking(
      bookingCode,
      email
    );

    if (!booking) {
      return NextResponse.json(
        {
          success: false,
          error:
            "ไม่พบการจองที่กำลังดำเนินการ กรุณาตรวจสอบ Booking Code และอีเมลอีกครั้ง",
        },
        { status: 404 }
      );
    }

    // =====================================
    // 3. ตรวจสอบ Nature Experience
    // =====================================

    if (booking.nature_experience_selected) {
      if (action === "save") {
        return NextResponse.json(
          {
            success: false,
            error:
              "การจองนี้รวมอาหาร 3 มื้อในกิจกรรมวิถีบ้านป่าแล้ว ไม่สามารถสั่งอาหารเย็นเพิ่มเติมได้",
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,

        booking_code: booking.booking_code,
        guest_name: booking.guest_name,
        check_in: booking.check_in,
        check_out: booking.check_out,

        nature_experience_selected: true,

        dinner_items: [],
        dinner_total: 0,

        message:
          "การจองนี้รวมอาหาร 3 มื้อในกิจกรรมวิถีบ้านป่าแล้ว ไม่จำเป็นต้องสั่งอาหารเย็นเพิ่มเติม",
      });
    }

    // =====================================
    // 4. ตรวจสอบกำหนดเวลาสั่งอาหาร
    // =====================================

    if (
      booking.check_in < getMinimumOrderDate()
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "กรุณาสั่งอาหารล่วงหน้าอย่างน้อย 1 วันก่อนวันเข้าพัก",
        },
        { status: 400 }
      );
    }

    // =====================================
    // 5. โหมดตรวจสอบ Booking
    // =====================================

    if (action === "verify") {
      return NextResponse.json({
        success: true,

        booking_code: booking.booking_code,

        guest_name: booking.guest_name,

        check_in: booking.check_in,

        check_out: booking.check_out,

        dinner_items: booking.dinner_items ?? [],

        dinner_total: Number(
          booking.dinner_total ?? 0
        ),

        nature_experience_selected: false,

        message:
          "ตรวจสอบการจองเรียบร้อยแล้ว",
      });
    }

    // =====================================
    // 6. ตรวจสอบรายการอาหาร
    // =====================================

    const rawItems = Array.isArray(
      body.dinner_items
    )
      ? body.dinner_items
      : null;

    if (
      !rawItems ||
      rawItems.length === 0 ||
      rawItems.length > DINNER_MENU.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "กรุณาเลือกรายการอาหารอย่างน้อย 1 รายการ",
        },
        { status: 400 }
      );
    }

    const dinnerItems: SavedDinnerItem[] = [];

    const usedIds = new Set<string>();

    for (const rawItem of rawItems) {
      const id = String(
        rawItem?.id ?? ""
      ).trim();

      const quantity = Number(
        rawItem?.quantity
      );

      const menuItem = DINNER_MENU.find(
        (item) => item.id === id
      );

      if (!menuItem) {
        return NextResponse.json(
          {
            success: false,
            error:
              "พบรายการอาหารที่ไม่มีอยู่ในเมนู",
          },
          { status: 400 }
        );
      }

      if (usedIds.has(id)) {
        return NextResponse.json(
          {
            success: false,
            error: "พบรายการอาหารซ้ำ",
          },
          { status: 400 }
        );
      }

      if (
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > 20
      ) {
        return NextResponse.json(
          {
            success: false,
            error:
              "จำนวนอาหารต้องอยู่ระหว่าง 1–20",
          },
          { status: 400 }
        );
      }

      usedIds.add(id);

      // ใช้ชื่อและราคาจากเมนูฝั่ง Server เท่านั้น
      dinnerItems.push({
        id: menuItem.id,
        name: menuItem.name,
        price: menuItem.price,
        quantity,
      });
    }

    // =====================================
    // 7. คำนวณค่าอาหารจาก Server
    // =====================================

    const dinnerTotal = dinnerItems.reduce(
      (sum, item) =>
        sum + item.price * item.quantity,
      0
    );

    // =====================================
    // 8. บันทึกลง Booking เดิม
    // ไม่เปลี่ยน total_price
    // =====================================

    const {
      data: updatedBooking,
      error: updateError,
    } = await supabaseAdmin
      .from("bookings")
      .update({
        dinner_items: dinnerItems,
        dinner_total: dinnerTotal,
      })
      .eq("id", booking.id)
      .eq("booking_status", booking.booking_status)
      .select("id, booking_code")
      .maybeSingle();

    if (updateError) {
      console.error(
        "DINNER ORDER UPDATE ERROR:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "ไม่สามารถบันทึกรายการอาหารได้",
        },
        { status: 500 }
      );
    }

    if (!updatedBooking) {
      return NextResponse.json(
        {
          success: false,
          error:
            "สถานะการจองเปลี่ยนแปลง กรุณาตรวจสอบการจองอีกครั้ง",
        },
        { status: 409 }
      );
    }

    // =====================================
    // 9. แจ้งอีเมลแอดมิน
    // =====================================

    const adminEmailSent =
      await notifyAdminDinnerOrder(
        {
          booking_code: booking.booking_code,
          guest_name: booking.guest_name,
          email: booking.email,
          phone: booking.phone,
          check_in: booking.check_in,
          check_out: booking.check_out,
          room_id: booking.room_id,
        },
        dinnerItems,
        dinnerTotal
      );

    // =====================================
    // 10. ส่งผลกลับหน้าเว็บไซต์
    // =====================================

    return NextResponse.json({
      success: true,

      booking_code: updatedBooking.booking_code,

      dinner_items: dinnerItems,

      dinner_total: dinnerTotal,

      admin_email_sent: adminEmailSent,

      message:
        "บันทึกรายการอาหารเรียบร้อยแล้ว",
    });

  } catch (error) {
    console.error(
      "DINNER ORDER ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการบันทึกรายการอาหาร",
      },
      { status: 500 }
    );
  }
}