import "server-only";

import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

type DinnerItem = {
  id?: string;
  name?: string;
  price?: number | string;
  quantity?: number | string;
};

type Booking = {
  id: string;
  booking_code: string | null;
  room_id: string;
  guest_name: string;
  email: string | null;
  phone: string;
  adults: number | null;
  children: number | null;
  child_ages: unknown;
  check_in: string;
  check_out: string;
  total_price: number | string;
  payment_status: string | null;
  booking_status: string | null;

  nature_experience_selected: boolean | null;
  nature_experience_date: string | null;
  nature_experience_participants: number | null;
  nature_experience_total: number | string | null;

  dinner_items: unknown;
  dinner_total: number | string | null;
};

const ADMIN_EMAIL = "toktak3824@gmail.com";

const FROM_EMAIL = "Laklai View <booking@laklaiview.com>";

const ADMIN_URL = "https://laklaiview.com/admin/bookings";

// =========================================
// HTML ESCAPE
// =========================================

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return map[char];
  });
}

// =========================================
// FORMAT MONEY
// =========================================

function money(value: unknown): string {
  const amount = Number(value ?? 0);

  return (
    Number.isFinite(amount) ? amount : 0
  ).toLocaleString("th-TH");
}

// =========================================
// ROOM NAME
// =========================================

function roomName(roomId: string): string {
  const names: Record<string, string> = {
    house1: "บ้านสวนวิถี",
    house2: "บ้านพักใจ",
    house3: "บ้านอุ่นใจ",
    house4: "บ้านสุขใจ",
  };

  return names[roomId] ?? roomId;
}

// =========================================
// DINNER ITEMS
// =========================================

function getDinnerItems(value: unknown): DinnerItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(
      (item): item is DinnerItem =>
        typeof item === "object" &&
        item !== null,
    )
    .map((item) => ({
      id: String(item.id ?? ""),
      name: String(item.name ?? "ไม่ระบุชื่ออาหาร"),
      price: Number(item.price ?? 0),
      quantity: Number(item.quantity ?? 0),
    }))
    .filter(
      (item) =>
        Number(item.quantity) > 0 &&
        Number.isFinite(Number(item.price)),
    );
}

// =========================================
// DINNER HTML
// =========================================

function createDinnerHtml(items: DinnerItem[]): string {
  if (items.length === 0) {
    return "";
  }

  const rows = items
    .map((item) => {
      const quantity = Number(item.quantity ?? 0);
      const price = Number(item.price ?? 0);
      const subtotal = quantity * price;

      return `
        <tr>
          <td style="
            padding:12px 8px;
            border-bottom:1px solid #e7e5e4;
            color:#292524;
          ">
            ${escapeHtml(item.name)}
          </td>

          <td style="
            padding:12px 8px;
            text-align:center;
            border-bottom:1px solid #e7e5e4;
            color:#292524;
          ">
            ${quantity}
          </td>

          <td style="
            padding:12px 8px;
            text-align:right;
            border-bottom:1px solid #e7e5e4;
            color:#292524;
          ">
            ฿${money(price)}
          </td>

          <td style="
            padding:12px 8px;
            text-align:right;
            border-bottom:1px solid #e7e5e4;
            font-weight:bold;
            color:#292524;
          ">
            ฿${money(subtotal)}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <div style="
      overflow-x:auto;
      border:1px solid #e7e5e4;
      border-radius:12px;
      background:#ffffff;
    ">
      <table style="
        width:100%;
        border-collapse:collapse;
        font-size:14px;
      ">
        <thead>
          <tr style="
            background:#f5f5f4;
            color:#57534e;
          ">
            <th style="padding:12px 8px;text-align:left;">
              รายการอาหาร
            </th>

            <th style="padding:12px 8px;text-align:center;">
              จำนวน
            </th>

            <th style="padding:12px 8px;text-align:right;">
              ราคาต่อหน่วย
            </th>

            <th style="padding:12px 8px;text-align:right;">
              รวม
            </th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>
      </table>
    </div>
  `;
}

// =========================================
// CLAIM EMAIL EVENT
// ป้องกันส่งอีเมลซ้ำ
// =========================================

async function claimEmailEvent(
  bookingId: string,
  eventKey: string,
): Promise<boolean> {
  const { data, error } = await supabaseAdmin.rpc(
    "claim_booking_email_event",
    {
      p_booking_id: bookingId,
      p_event_type: "admin_slip_received",
      p_event_key: eventKey,
    },
  );

  if (error) {
    console.error(
      "CLAIM ADMIN EMAIL EVENT ERROR =",
      error,
    );

    throw error;
  }

  return data === true;
}

// =========================================
// FINISH EMAIL EVENT
// =========================================

async function finishEmailEvent(
  bookingId: string,
  eventKey: string,
  status: "sent" | "failed",
  errorMessage?: string,
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("booking_email_events")
    .update({
      status,
      error_message: errorMessage ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("booking_id", bookingId)
    .eq("event_type", "admin_slip_received")
    .eq("event_key", eventKey);

  if (error) {
    console.error(
      "UPDATE ADMIN EMAIL EVENT ERROR =",
      error,
    );
  }
}

// =========================================
// SEND BOOKING SLIP NOTIFICATIONS
// =========================================

export async function sendBookingSlipNotifications(
  booking: Booking,
  slipPath: string,
): Promise<{
  customer: string;
  admin: string;
}> {
  const resendKey = process.env.RESEND_API_KEY;

  if (!resendKey) {
    throw new Error(
      "ไม่พบ RESEND_API_KEY ใน Environment Variables",
    );
  }

  const resend = new Resend(resendKey);

  // =========================================
  // BOOKING INFORMATION
  // =========================================

  const bookingCode = String(
    booking.booking_code ?? "",
  );

  const total = Math.max(
    0,
    Number(booking.total_price ?? 0),
  );

  // มัดจำ 50% เมื่อยอดตั้งแต่ 4,000 บาทขึ้นไป
  // ต่ำกว่า 4,000 บาท ชำระเต็มจำนวน

  const deposit =
    total >= 4000
      ? Math.ceil(total / 2)
      : total;

  const remaining = Math.max(
    0,
    total - deposit,
  );

  const room = roomName(booking.room_id);

  // =========================================
  // CHILD AGES
  // =========================================

  const ages = Array.isArray(booking.child_ages)
    ? booking.child_ages
        .map((age) => Number(age))
        .filter(
          (age) =>
            Number.isFinite(age) &&
            age >= 0,
        )
    : [];

  // เด็กอายุ 0–8 ปี
  const youngChildren = ages.filter(
    (age) => age <= 8,
  );

  // เด็กอายุ 9–14 ปี
  const olderChildren = ages.filter(
    (age) => age >= 9 && age <= 14,
  );

  // อายุ 15 ปีขึ้นไป นับเป็นผู้ใหญ่
  const adultChildren = ages.filter(
    (age) => age >= 15,
  );

  const effectiveAdults =
    Number(booking.adults ?? 0) +
    adultChildren.length;

  const actualChildren =
    youngChildren.length +
    olderChildren.length;

  // =========================================
  // EXTRA BED INFORMATION
  // =========================================

  const needsExtraBed =
    effectiveAdults >= 3 ||
    olderChildren.length > 0 ||
    youngChildren.length >= 2;

  const extraBedHtml = `
    <p>
      <b>จำนวนผู้ใหญ่ที่นับตามอายุ:</b>
      ${effectiveAdults} คน
    </p>

    <p>
      <b>จำนวนเด็ก:</b>
      ${actualChildren} คน
    </p>

    <p>
      <b>รายละเอียดอายุเด็ก:</b>
      ${
        ages.length > 0
          ? escapeHtml(
              ages
                .map((age) => `${age} ปี`)
                .join(", "),
            )
          : "ไม่มีข้อมูลอายุเด็ก"
      }
    </p>

    <p style="
      background:${needsExtraBed ? "#fff7ed" : "#f0fdf4"};
      border:1px solid ${needsExtraBed ? "#fed7aa" : "#bbf7d0"};
      border-radius:8px;
      padding:12px;
      color:${needsExtraBed ? "#9a3412" : "#166534"};
    ">
      <b>การเตรียมที่นอนเสริม:</b>
      ${
        needsExtraBed
          ? "ต้องเตรียมที่นอนเสริม"
          : "ไม่จำเป็นต้องเตรียมที่นอนเสริม"
      }
    </p>
  `;

  // =========================================
  // NATURE EXPERIENCE
  // =========================================

  const activityTotal = Math.max(
    0,
    Number(booking.nature_experience_total ?? 0),
  );

  const hasNatureExperience =
    booking.nature_experience_selected === true;

  // =========================================
  // DINNER INFORMATION
  // =========================================

  const dinnerItems = getDinnerItems(
    booking.dinner_items,
  );

  const dinnerTotal = Math.max(
    0,
    Number(booking.dinner_total ?? 0),
  );

  // Nature Experience รวมอาหาร 3 มื้อ
  // จึงไม่แสดงรายการอาหารเย็นซ้ำ

  const shouldShowDinner =
    !hasNatureExperience &&
    dinnerItems.length > 0;

  const dinnerHtml = shouldShowDinner
    ? `
      <div style="
        background:#fff7ed;
        border:1px solid #fed7aa;
        border-radius:14px;
        padding:20px;
        margin-top:16px;
      ">
        <h3 style="
          margin-top:0;
          color:#9a3412;
        ">
          🍽️ รายการอาหารที่สั่ง
        </h3>

        ${createDinnerHtml(dinnerItems)}

        <div style="
          display:flex;
          justify-content:space-between;
          align-items:center;
          margin-top:18px;
          padding-top:14px;
          border-top:1px solid #fed7aa;
        ">
          <strong style="color:#7c2d12;">
            รวมค่าอาหาร
          </strong>

          <strong style="
            color:#c2410c;
            font-size:22px;
          ">
            ฿${money(dinnerTotal)}
          </strong>
        </div>

        <p style="
          color:#9a3412;
          font-size:13px;
          margin-bottom:0;
        ">
          ค่าอาหารไม่รวมกับยอดค่าที่พักและกิจกรรม
          ชำระค่าอาหารในวันเช็กอิน
        </p>
      </div>
    `
    : "";

  // =========================================
  // BOOKING DETAILS HTML
  // =========================================

  const details = `
    <div style="
      background:#ffffff;
      border:1px solid #e7e5e4;
      border-radius:14px;
      padding:20px;
      margin-top:20px;
    ">
      <h3 style="
        margin-top:0;
        color:#065f46;
      ">
        รายละเอียดการจอง
      </h3>

      <p>
        <b>เลขที่การจอง:</b>
        ${escapeHtml(bookingCode)}
      </p>

      <p>
        <b>บ้านพัก:</b>
        ${escapeHtml(room)}
      </p>

      <p>
        <b>ผู้จอง:</b>
        ${escapeHtml(booking.guest_name)}
      </p>

      <p>
        <b>โทรศัพท์:</b>
        ${escapeHtml(booking.phone)}
      </p>

      <p>
        <b>อีเมล:</b>
        ${escapeHtml(booking.email)}
      </p>

      <p>
        <b>เช็กอิน:</b>
        ${escapeHtml(booking.check_in)}
      </p>

      <p>
        <b>เช็กเอาต์:</b>
        ${escapeHtml(booking.check_out)}
      </p>

      ${extraBedHtml}
    </div>

    <!-- NATURE EXPERIENCE -->

    <div style="
      background:#f0fdf4;
      border:1px solid #bbf7d0;
      border-radius:14px;
      padding:20px;
      margin-top:16px;
    ">
      <h3 style="
        margin-top:0;
        color:#166534;
      ">
        🌿 กิจกรรมวิถีบ้านป่า
      </h3>

      ${
        hasNatureExperience
          ? `
            <p>
              <b>สถานะ:</b>
              เลือกกิจกรรมแล้ว
            </p>

            <p>
              <b>วันที่:</b>
              ${escapeHtml(
                booking.nature_experience_date,
              )}
            </p>

            <p>
              <b>ผู้เข้าร่วม:</b>
              ${Number(
                booking.nature_experience_participants ?? 0,
              )} คน
            </p>

            <p>
              <b>ค่ากิจกรรม:</b>
              ฿${money(activityTotal)}
            </p>

            <p style="
              background:#dcfce7;
              border-radius:8px;
              padding:12px;
              color:#166534;
              margin-bottom:0;
            ">
              แพ็กเกจกิจกรรมรวมอาหาร 3 มื้อแล้ว
              ไม่ต้องสั่งอาหารเย็นเพิ่มเติม
            </p>
          `
          : `
            <p>
              ไม่ได้เลือกกิจกรรม
            </p>
          `
      }
    </div>

    <!-- DINNER ORDER -->
    ${dinnerHtml}

    <!-- PAYMENT SUMMARY -->

    <div style="
      background:#f5f5f4;
      border:1px solid #e7e5e4;
      border-radius:14px;
      padding:20px;
      margin-top:16px;
    ">
      <h3 style="
        margin-top:0;
        color:#292524;
      ">
        สรุปยอดการชำระเงิน
      </h3>

      <p>
        <b>ค่าที่พักรวมกิจกรรม:</b>
        ฿${money(total)}
      </p>

      <p>
        <b>ยอดที่ต้องชำระ:</b>
        ฿${money(deposit)}
      </p>

      <p>
        <b>ยอดคงเหลือ:</b>
        ฿${money(remaining)}
      </p>

      <p style="
        color:#9a3412;
        font-size:13px;
      ">
        หมายเหตุ: ค่าอาหารไม่รวมอยู่ในยอดโอนนี้
        หากมีรายการอาหารเพิ่มเติม
        ลูกค้าชำระในวันเช็กอิน
      </p>
    </div>
  `;

  // =========================================
  // ไม่ส่งอีเมลให้ลูกค้าในขั้นตอนแนบสลิป
  // ลูกค้าจะได้รับอีเมลหลัง Admin ยืนยันการชำระเงิน
  // =========================================

  const customerStatus = "not_sent";

  // =========================================
  // แจ้งเตือน ADMIN เมื่อมีสลิปใหม่
  // =========================================

  const eventKey = "slip_received";

  let adminStatus:
    | "sent"
    | "failed"
    | "already_sent" = "already_sent";

  const adminClaimed = await claimEmailEvent(
    booking.id,
    eventKey,
  );

  if (adminClaimed) {
    try {
      const { error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,

        subject:
          `🔔 ได้รับสลิปใหม่ ${bookingCode} — ${room}`,

        html: `
          <div style="
            font-family:Arial,sans-serif;
            line-height:1.8;
            color:#292524;
            max-width:720px;
            margin:0 auto;
            padding:20px;
            background:#fafaf9;
          ">

            <!-- HEADER -->

            <div style="
              background:linear-gradient(135deg,#064e3b,#047857);
              color:#ffffff;
              padding:28px;
              border-radius:16px;
              text-align:center;
            ">
              <h1 style="
                margin:0;
                font-size:26px;
              ">
                Laklai View
              </h1>

              <p style="margin:8px 0 0;">
                มีสลิปการชำระเงินเข้ามาใหม่
              </p>
            </div>

            <!-- ALERT -->

            <div style="
              background:#ecfdf5;
              border:1px solid #a7f3d0;
              border-radius:12px;
              padding:18px;
              margin-top:18px;
            ">
              <strong style="color:#065f46;">
                ลูกค้าได้แนบหลักฐานการชำระเงินแล้ว
              </strong>

              <p style="margin-bottom:0;">
                กรุณาตรวจสอบยอดเงินจริง
                ก่อนกดยืนยันการชำระเงินในระบบหลังบ้าน
              </p>
            </div>

            ${details}

            <!-- SLIP PATH -->

            <div style="
              background:#ffffff;
              border:1px solid #e7e5e4;
              border-radius:12px;
              padding:16px;
              margin-top:18px;
            ">
              <h3 style="margin-top:0;">
                หลักฐานการชำระเงิน
              </h3>

              <p style="
                word-break:break-all;
                font-size:13px;
              ">
                ${escapeHtml(slipPath)}
              </p>

              <p style="
                color:#78716c;
                font-size:13px;
              ">
                หมายเหตุ: ไฟล์สลิปเก็บอยู่ใน Private Storage
              </p>
            </div>

            <!-- ADMIN BUTTON -->

            <div style="
              text-align:center;
              margin-top:24px;
            ">
              <a
                href="${ADMIN_URL}"
                style="
                  display:inline-block;
                  background:#047857;
                  color:#ffffff;
                  text-decoration:none;
                  padding:14px 28px;
                  border-radius:10px;
                  font-weight:bold;
                "
              >
                เปิดระบบหลังบ้านเพื่อตรวจสอบสลิป
              </a>
            </div>

            <p style="
              color:#78716c;
              font-size:12px;
              text-align:center;
              margin-top:28px;
            ">
              Laklai View — หลักลาย view วิถีบ้านป่า
            </p>
          </div>
        `,
      });

      if (error) {
        throw error;
      }

      adminStatus = "sent";

      await finishEmailEvent(
        booking.id,
        eventKey,
        "sent",
      );
    } catch (error) {
      adminStatus = "failed";

      await finishEmailEvent(
        booking.id,
        eventKey,
        "failed",
        String(error),
      );

      console.error(
        "ADMIN SLIP EMAIL ERROR =",
        error,
      );
    }
  }

  return {
    customer: customerStatus,
    admin: adminStatus,
  };
}