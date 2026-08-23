import { NextResponse } from "next/server";
import { Resend } from "resend";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthenticated } from "@/lib/adminAuth";

const SHIPPING_FEE = 50;
const resend = new Resend(process.env.RESEND_API_KEY);
const ADMIN_EMAIL = "toktak3824@gmail.com";
const FROM_EMAIL = "Laklai View <booking@laklaiview.com>";

type CoffeeItem = {
  variety: "arabica" | "robusta";
  roastLevel: "light" | "medium" | "dark";
  sizeGrams: 250 | 500 | 1000;
  grindType: "whole_bean" | "drip" | "espresso" | "moka";
  quantity: number;
};

function getBasePrice(
  variety: CoffeeItem["variety"],
  sizeGrams: CoffeeItem["sizeGrams"]
) {
  const grams = Number(sizeGrams);

  if (variety === "arabica") {
    if (grams === 250) return 209;
    if (grams === 500) return 390;
    if (grams === 1000) return 779;
  }

  if (variety === "robusta") {
    if (grams === 250) return 179;
    if (grams === 500) return 349;
    if (grams === 1000) return 690;
  }

  throw new Error("ไม่พบราคาสินค้า");
}

function getFinalUnitPrice(
  variety: CoffeeItem["variety"],
  sizeGrams: CoffeeItem["sizeGrams"],
  grindType: CoffeeItem["grindType"]
) {
  /*
   * ข้อมูลจากหน้าเว็บอาจส่ง sizeGrams มาเป็น string เช่น "1000"
   * แม้ TypeScript จะกำหนด type เป็น number
   * จึงต้องแปลงเป็น Number ก่อนเปรียบเทียบเสมอ
   */
  const grams = Number(sizeGrams);

  const basePrice = getBasePrice(
    variety,
    grams as CoffeeItem["sizeGrams"]
  );

  /* เมล็ดเต็ม = ราคาปกติ */
  if (grindType === "whole_bean") {
    return basePrice;
  }

  /*
   * กาแฟบดมีราคาขายสุดท้ายตามขนาด
   * ใช้ราคากาแฟบดของขนาดนั้นสำหรับ Drip / Espresso / Moka
   */
  if (variety === "arabica") {
    if (grams === 250) return 220;
    if (grams === 500) return 409;
    if (grams === 1000) return 789;
  }

  if (variety === "robusta") {
    if (grams === 250) return 190;
    if (grams === 500) return 360;
    if (grams === 1000) return 709;
  }

  throw new Error("ไม่พบราคาสำหรับรูปแบบการบด");
}

function generateOrderCode() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const random = Math.floor(1000 + Math.random() * 9000);

  return `LKC-${year}${month}${day}-${random}`;
}



function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function varietyText(value: string) {
  return value === "arabica" ? "Arabica" : "Robusta";
}

function roastText(value: string) {
  if (value === "light") return "คั่วอ่อน";
  if (value === "medium") return "คั่วกลาง";
  return "คั่วเข้ม";
}

function grindText(value: string) {
  if (value === "whole_bean") return "เมล็ดเต็ม";
  if (value === "drip") return "บดสำหรับดริป";
  if (value === "espresso") return "บดสำหรับ Espresso";
  return "บดสำหรับ Moka";
}

async function sendCoffeeOrderEmails({
  order,
  customerEmail,
  firstName,
  lastName,
  phone,
  address,
  subdistrict,
  district,
  province,
  postalCode,
  calculatedItems,
  subtotal,
  shippingFee,
  totalPrice,
}: {
  order: { order_code: string };
  customerEmail: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  calculatedItems: Array<{
    variety: string;
    roast_level: string;
    size_grams: number;
    grind_type: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  totalPrice: number;
}) {
  const orderCode = String(order.order_code);

  const itemsHtml = calculatedItems
    .map(
      (item) => `
        <div style="padding:14px 0;border-bottom:1px solid #e5e5e5;">
          <p style="margin:0 0 6px;font-size:17px;">
            <b>${escapeHtml(varietyText(item.variety))} ${escapeHtml(roastText(item.roast_level))}</b>
          </p>
          <p style="margin:4px 0;color:#555;">
            ขนาด ${escapeHtml(item.size_grams)} กรัม ·
            ${escapeHtml(grindText(item.grind_type))} ·
            ${escapeHtml(item.quantity)} ถุง
          </p>
          <p style="margin:4px 0;">
            ฿${Number(item.subtotal).toLocaleString("th-TH")}
          </p>
        </div>
      `
    )
    .join("");

  const paymentUrl =
    `https://laklaiview.com/coffee/payment/${encodeURIComponent(orderCode)}`;

  const customerResult = await resend.emails.send({
    from: FROM_EMAIL,
    to: customerEmail,
    subject: `☕ ได้รับคำสั่งซื้อ Laklai View Coffee แล้ว — ${orderCode}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#222;max-width:680px;margin:auto;">
        <h2>☕ ขอบคุณสำหรับคำสั่งซื้อ Laklai View Coffee</h2>
        <p>สวัสดีคุณ <b>${escapeHtml(firstName)} ${escapeHtml(lastName)}</b></p>
        <p>เราได้รับคำสั่งซื้อของคุณเรียบร้อยแล้ว</p>

        <hr>

        <h3>รายละเอียดคำสั่งซื้อ</h3>
        <p><b>เลขที่คำสั่งซื้อ:</b> ${escapeHtml(orderCode)}</p>
        <p><b>สถานะ:</b> รอการชำระเงิน</p>

        ${itemsHtml}

        <hr>

        <p>ค่าสินค้า: ฿${Number(subtotal).toLocaleString("th-TH")}</p>
        <p>ค่าจัดส่ง: ฿${Number(shippingFee).toLocaleString("th-TH")}</p>
        <p style="font-size:21px;"><b>ยอดรวม: ฿${Number(totalPrice).toLocaleString("th-TH")}</b></p>

        <p>
          กรุณาชำระเงินผ่านหน้าชำระเงินของคำสั่งซื้อ
        </p>

        <p style="margin:25px 0;">
          <a href="${paymentUrl}"
             style="display:inline-block;background:#3f4a38;color:#fff;text-decoration:none;padding:12px 22px;border-radius:8px;">
            ไปหน้าชำระเงิน
          </a>
        </p>

        <hr>

        <p><b>หากชำระเงินแล้ว กรุณาอัปโหลดสลิปในหน้าชำระเงิน</b></p>
        <p>ขอบคุณที่เลือก Laklai View Coffee ❤️</p>
      </div>
    `,
  });

  if (customerResult.error) {
    throw new Error(`CUSTOMER EMAIL ERROR: ${customerResult.error.message}`);
  }

  const adminResult = await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `🔔 มีคำสั่งซื้อกาแฟใหม่ ${orderCode}`,
    html: `
      <div style="font-family:Arial,sans-serif;line-height:1.7;color:#222;max-width:720px;margin:auto;">
        <h2>🔔 มีคำสั่งซื้อกาแฟใหม่</h2>

        <p><b>เลขที่คำสั่งซื้อ:</b> ${escapeHtml(orderCode)}</p>
        <p><b>สถานะคำสั่งซื้อ:</b> รอดำเนินการ</p>
        <p><b>สถานะการชำระเงิน:</b> รอการชำระเงิน</p>

        <hr>

        <h3>ข้อมูลลูกค้า</h3>
        <p><b>ชื่อ:</b> ${escapeHtml(firstName)} ${escapeHtml(lastName)}</p>
        <p><b>โทรศัพท์:</b> ${escapeHtml(phone)}</p>
        <p><b>อีเมล:</b> ${escapeHtml(customerEmail)}</p>

        <h3>ที่อยู่จัดส่ง</h3>
        <p>
          ${escapeHtml(address)}<br>
          ${escapeHtml(subdistrict)} ${escapeHtml(district)}<br>
          ${escapeHtml(province)} ${escapeHtml(postalCode)}
        </p>

        <hr>

        <h3>รายการกาแฟ</h3>
        ${itemsHtml}

        <hr>

        <p>ค่าสินค้า: ฿${Number(subtotal).toLocaleString("th-TH")}</p>
        <p>ค่าจัดส่ง: ฿${Number(shippingFee).toLocaleString("th-TH")}</p>
        <p style="font-size:22px;"><b>ยอดรวม: ฿${Number(totalPrice).toLocaleString("th-TH")}</b></p>

        <hr>

        <p>
          กรุณาตรวจสอบออเดอร์และหลักฐานการชำระเงินในระบบ Admin Dashboard
        </p>
      </div>
    `,
  });

  if (adminResult.error) {
    throw new Error(`ADMIN EMAIL ERROR: ${adminResult.error.message}`);
  }

  return {
    customerEmailId: customerResult.data?.id ?? null,
    adminEmailId: adminResult.data?.id ?? null,
  };
}

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }


  try {
    const { data, error } = await supabaseAdmin
      .from("coffee_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("COFFEE ORDERS GET ERROR =", error);

      return NextResponse.json(
        {
          error: "ไม่สามารถโหลดรายการสั่งซื้อได้",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      orders: data ?? [],
    });
  } catch (error) {
    console.error("COFFEE ORDERS GET ERROR =", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการโหลดรายการสั่งซื้อ",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("========== COFFEE ORDER ==========");
    console.log("BODY =", body);

    const {
      firstName,
      lastName,
      phone,
      email,

      address,
      subdistrict,
      district,
      province,
      postalCode,

      items,
    } = body;

    // =========================================
    // ตรวจข้อมูลลูกค้า
    // =========================================

    if (!firstName?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกชื่อ" },
        { status: 400 }
      );
    }

    if (!lastName?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกนามสกุล" },
        { status: 400 }
      );
    }

    if (!phone?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกเบอร์โทรศัพท์" },
        { status: 400 }
      );
    }

    if (!email?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกอีเมล" },
        { status: 400 }
      );
    }

    const customerEmail = String(email).trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        customerEmail
      )
    ) {
      return NextResponse.json(
        { error: "รูปแบบอีเมลไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    if (!address?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกที่อยู่โดยละเอียด" },
        { status: 400 }
      );
    }
    if (!subdistrict?.trim()) {
  return NextResponse.json(
    { error: "กรุณากรอกตำบล / แขวง" },
    { status: 400 }
  );
}

if (!district?.trim()) {
  return NextResponse.json(
    { error: "กรุณากรอกอำเภอ / เขต" },
    { status: 400 }
  );
}
    if (!province?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกจังหวัด" },
        { status: 400 }
      );
    }

    if (!postalCode?.trim()) {
      return NextResponse.json(
        { error: "กรุณากรอกรหัสไปรษณีย์" },
        { status: 400 }
      );
    }

    // =========================================
    // ตรวจรายการสินค้า
    // =========================================

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "กรุณาเลือกสินค้าอย่างน้อย 1 รายการ" },
        { status: 400 }
      );
    }

    // =========================================
    // คำนวณราคาใหม่จาก Server
    // ห้ามเชื่อราคาที่ส่งมาจากหน้าเว็บ
    // =========================================

    const calculatedItems = items.map(
      (item: CoffeeItem) => {

        const validVarieties = [
          "arabica",
          "robusta",
        ];

        const validRoasts = [
          "light",
          "medium",
          "dark",
        ];

        const validSizes = [
          250,
          500,
          1000,
        ];

        const validGrinds = [
  "whole",
  "whole_bean",
  "drip",
  "espresso",
  "moka",
];

        if (
          !validVarieties.includes(
            item.variety
          )
        ) {
          throw new Error(
            "ไม่พบสายพันธุ์กาแฟที่เลือก"
          );
        }

        if (
          !validRoasts.includes(
            item.roastLevel
          )
        ) {
          throw new Error(
            "ไม่พบระดับการคั่วที่เลือก"
          );
        }

        if (
          !validSizes.includes(
            Number(item.sizeGrams)
          )
        ) {
          throw new Error(
            "ขนาดกาแฟไม่ถูกต้อง"
          );
        }

        if (
          !validGrinds.includes(
            item.grindType
          )
        ) {
          throw new Error(
            "รูปแบบการบดไม่ถูกต้อง"
          );
        }

        const quantity = Number(
          item.quantity
        );

        if (
          !Number.isInteger(quantity) ||
          quantity < 1 ||
          quantity > 10
        ) {
          throw new Error(
            "จำนวนสินค้าต้องอยู่ระหว่าง 1-10"
          );
        }

        const unitPrice =
          getFinalUnitPrice(
            item.variety,
            item.sizeGrams,
            item.grindType
          );

        return {
          variety: item.variety,
          roast_level: item.roastLevel,
          size_grams: item.sizeGrams,
          grind_type: item.grindType,
          quantity,
          unit_price: unitPrice,
          subtotal: unitPrice * quantity,
        };
      }
    );

    // =========================================
    // รวมราคาสินค้า
    // =========================================

    const subtotal =
      calculatedItems.reduce(
        (sum, item) =>
          sum + item.subtotal,
        0
      );

    const totalPrice =
      subtotal + SHIPPING_FEE;

    // =========================================
    // สร้างเลข Order
    // =========================================

    const orderCode =
      generateOrderCode();

    console.log(
      "ORDER CODE =",
      orderCode
    );

    console.log(
      "SUBTOTAL =",
      subtotal
    );

    console.log(
      "SHIPPING =",
      SHIPPING_FEE
    );

    console.log(
      "TOTAL =",
      totalPrice
    );

    // =========================================
    // บันทึกลง Supabase
    // =========================================

    const { data, error } =
      await supabaseAdmin
        .from("coffee_orders")
        .insert({
          order_code: orderCode,

          first_name:
            String(firstName).trim(),

          last_name:
            String(lastName).trim(),

          phone:
            String(phone).trim(),

          email:
            customerEmail,

          address:
            String(address).trim(),

          subdistrict:
            subdistrict
              ? String(subdistrict).trim()
              : null,

          district:
            district
              ? String(district).trim()
              : null,

          province:
            String(province).trim(),

          postal_code:
            String(postalCode).trim(),

          variety:
  calculatedItems.length === 1
    ? calculatedItems[0].variety
    : "multiple",

bean_type:
  calculatedItems.length === 1
    ? calculatedItems[0].variety
    : "multiple",

          roast_level:
            calculatedItems.length === 1
              ? calculatedItems[0].roast_level
              : "multiple",

          size_grams:
            calculatedItems.length === 1
              ? calculatedItems[0].size_grams
              : null,

          grind_type:
            calculatedItems.length === 1
              ? calculatedItems[0].grind_type
              : "multiple",

          quantity:
            calculatedItems.length === 1
              ? calculatedItems[0].quantity
              : calculatedItems.reduce(
                  (sum, item) =>
                    sum + item.quantity,
                  0
                ),

          unit_price:
  calculatedItems.length === 1
    ? calculatedItems[0].unit_price
    : null,

product_price:
  subtotal,

shipping_fee:
  SHIPPING_FEE,

          total_price:
            totalPrice,

          order_items:
            calculatedItems,

          order_status:
            "pending",

          payment_status:
            "waiting",
        })
        .select()
        .single();

    if (error) {
      console.error(
        "COFFEE ORDER DATABASE ERROR =",
        error
      );

      return NextResponse.json(
        {
          error:
            "ไม่สามารถบันทึกคำสั่งซื้อได้",
          detail: error.message,
        },
        { status: 500 }
      );
    }

    console.log(
      "บันทึกคำสั่งซื้อสำเร็จ:",
      data
    );

    // =========================================
    // ส่งอีเมลให้ลูกค้า + ADMIN
    // =========================================
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const emailResult = await sendCoffeeOrderEmails({
        order: data,
        customerEmail,
        firstName: String(firstName).trim(),
        lastName: String(lastName).trim(),
        phone: String(phone).trim(),
        address: String(address).trim(),
        subdistrict: String(subdistrict).trim(),
        district: String(district).trim(),
        province: String(province).trim(),
        postalCode: String(postalCode).trim(),
        calculatedItems,
        subtotal,
        shippingFee: SHIPPING_FEE,
        totalPrice,
      });

      emailSent = true;

      console.log("CUSTOMER EMAIL SENT =", emailResult.customerEmailId);
      console.log("ADMIN EMAIL SENT =", emailResult.adminEmailId);
    } catch (emailErrorCaught) {
      emailError =
        emailErrorCaught instanceof Error
          ? emailErrorCaught.message
          : String(emailErrorCaught);

      console.error(
        "COFFEE EMAIL ERROR =",
        emailError
      );

      // ไม่ยกเลิก Order เพราะบันทึกลงฐานข้อมูลสำเร็จแล้ว
    }

    console.log(
      "================================"
    );

    return NextResponse.json(
      {
        success: true,

        orderCode:
          data.order_code,

        subtotal,

        shippingFee:
          SHIPPING_FEE,

        totalPrice,

        emailSent,
        emailError,

        order: data,
      },
      { status: 201 }
    );

  } catch (error) {

    console.error(
      "COFFEE ORDER ERROR =",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ",
      },
      { status: 500 }
    );
  }
}

// =========================================
// PATCH — เปลี่ยนสถานะคำสั่งซื้อกาแฟ
// =========================================
export async function PATCH(req: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "ไม่มีสิทธิ์เข้าถึง" }, { status: 401 });
  }


  try {
    const body = await req.json();

    const { orderId, action } = body;

    console.log("========== COFFEE ORDER PATCH ==========");
    console.log("ORDER ID =", orderId);
    console.log("ACTION =", action);

    if (!orderId) {
      return NextResponse.json(
        { error: "ไม่พบรหัสคำสั่งซื้อ" },
        { status: 400 }
      );
    }

    if (!["confirm", "reject", "cancel"].includes(action)) {
      return NextResponse.json(
        { error: "คำสั่งไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    // =========================================
    // ดึงข้อมูล Order ก่อน
    // เพื่อเอา email ของลูกค้า
    // =========================================
    const { data: order, error: orderError } =
      await supabaseAdmin
        .from("coffee_orders")
        .select("*")
        .eq("id", orderId)
        .single();

    if (orderError || !order) {
      console.error(
        "COFFEE ORDER FIND ERROR =",
        orderError
      );

      return NextResponse.json(
        {
          error: "ไม่พบคำสั่งซื้อ",
          detail: orderError?.message,
        },
        { status: 404 }
      );
    }

    // =========================================
    // กำหนดสถานะใหม่
    // =========================================
    let updateData: {
      payment_status: string;
      order_status: string;
    };

    if (action === "confirm") {
      updateData = {
        payment_status: "paid",
        order_status: "processing",
      };
    } else if (action === "reject") {
      updateData = {
        payment_status: "waiting",
        order_status: "pending",
      };
    } else {
      updateData = {
        payment_status: "cancelled",
        order_status: "cancelled",
      };
    }

    // =========================================
    // อัปเดตฐานข้อมูล
    // =========================================
    const { data: updatedOrder, error: updateError } =
      await supabaseAdmin
        .from("coffee_orders")
        .update(updateData)
        .eq("id", orderId)
        .select()
        .single();

    if (updateError) {
      console.error(
        "COFFEE ORDER UPDATE ERROR =",
        updateError
      );

      return NextResponse.json(
        {
          error: "ไม่สามารถเปลี่ยนสถานะคำสั่งซื้อได้",
          detail: updateError.message,
        },
        { status: 500 }
      );
    }

    // =========================================
    // ถ้าเป็น REJECT
    // ส่งอีเมลให้ลูกค้าส่งสลิปใหม่
    // =========================================
    if (action === "reject") {
      try {
        const customerEmail =
          String(order.email ?? "").trim();

        if (!customerEmail) {
          throw new Error(
            "ไม่พบอีเมลของลูกค้า"
          );
        }

        const paymentUrl =
          `https://laklaiview.com/coffee/payment/${encodeURIComponent(
            order.order_code
          )}`;

        const emailResult =
          await resend.emails.send({
            from: FROM_EMAIL,

            to: customerEmail,

            subject:
              `⚠️ กรุณาส่งสลิปใหม่ — ${order.order_code}`,

            html: `
              <div
                style="
                  font-family: Arial, sans-serif;
                  line-height: 1.8;
                  color: #222;
                  max-width: 680px;
                  margin: auto;
                "
              >

                <h2 style="color:#b45309;">
                  ⚠️ กรุณาส่งหลักฐานการชำระเงินใหม่
                </h2>

                <p>
                  สวัสดีคุณ
                  <b>
                    ${escapeHtml(
                      order.first_name
                    )}
                    ${escapeHtml(
                      order.last_name
                    )}
                  </b>
                </p>

                <p>
                  ทาง Laklai View Coffee
                  ตรวจสอบหลักฐานการชำระเงินของคุณแล้ว
                  และขอให้คุณส่งสลิปการโอนเงินใหม่อีกครั้ง
                </p>

                <hr />

                <h3>
                  รายละเอียดคำสั่งซื้อ
                </h3>

                <p>
                  <b>เลขที่คำสั่งซื้อ:</b>
                  ${escapeHtml(
                    order.order_code
                  )}
                </p>

                <p>
                  <b>ยอดชำระ:</b>
                  ฿${Number(
                    order.total_price || 0
                  ).toLocaleString("th-TH")}
                </p>

                <p>
                  กรุณาตรวจสอบสลิปของคุณ
                  และอัปโหลดสลิปใหม่ผ่านหน้าคำสั่งซื้อ
                </p>

                <p style="margin:30px 0;">
                  <a
                    href="${paymentUrl}"
                    style="
                      display:inline-block;
                      background:#166534;
                      color:#ffffff;
                      text-decoration:none;
                      padding:14px 24px;
                      border-radius:10px;
                      font-weight:bold;
                    "
                  >
                    อัปโหลดสลิปใหม่
                  </a>
                </p>

                <hr />

                <p style="color:#666;">
                  หากคุณได้ส่งสลิปใหม่แล้ว
                  กรุณารอการตรวจสอบจากทาง Laklai View Coffee
                </p>

                <p>
                  ขอบคุณที่เลือก
                  <b>Laklai View Coffee</b> ❤️
                </p>

              </div>
            `,
          });

        console.log(
          "REJECT EMAIL SENT =",
          emailResult
        );

        if (emailResult.error) {
          throw new Error(
            emailResult.error.message
          );
        }

      } catch (emailError) {

        console.error(
          "REJECT EMAIL ERROR =",
          emailError
        );

        // ไม่ยกเลิกการเปลี่ยนสถานะ
        // เพราะฐานข้อมูลเปลี่ยนสำเร็จแล้ว

        return NextResponse.json({
          success: true,
          warning:
            "เปลี่ยนสถานะเรียบร้อยแล้ว แต่ส่งอีเมลแจ้งลูกค้าไม่สำเร็จ",
          emailError:
            emailError instanceof Error
              ? emailError.message
              : String(emailError),
          order: updatedOrder,
        });
      }
    }

    // =========================================
    // ถ้า CONFIRM
    // =========================================
    if (action === "confirm") {

      try {

        const customerEmail =
          String(order.email ?? "").trim();

        if (!customerEmail) {
          throw new Error(
            "ไม่พบอีเมลของลูกค้า"
          );
        }

        await resend.emails.send({
          from: FROM_EMAIL,

          to: customerEmail,

          subject:
            `✅ ยืนยันการชำระเงินแล้ว — ${order.order_code}`,

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                line-height: 1.8;
                color: #222;
                max-width: 680px;
                margin: auto;
              "
            >

              <h2 style="color:#166534;">
                ✅ ยืนยันการชำระเงินเรียบร้อยแล้ว
              </h2>

              <p>
                สวัสดีคุณ
                <b>
                  ${escapeHtml(
                    order.first_name
                  )}
                  ${escapeHtml(
                    order.last_name
                  )}
                </b>
              </p>

              <p>
                ทาง Laklai View Coffee
                ได้ตรวจสอบหลักฐานการชำระเงิน
                และยืนยันการชำระเงินของคุณเรียบร้อยแล้ว
              </p>

              <hr />

              <p>
                <b>เลขที่คำสั่งซื้อ:</b>
                ${escapeHtml(
                  order.order_code
                )}
              </p>

              <p>
                <b>ยอดชำระ:</b>
                ฿${Number(
                  order.total_price || 0
                ).toLocaleString("th-TH")}
              </p>

              <p>
                สถานะ:
                <b style="color:#166534;">
                  ชำระเงินแล้ว
                </b>
              </p>

              <hr />

              <p>
                ขอบคุณที่เลือก
                <b>Laklai View Coffee</b> ❤️
              </p>

            </div>
          `,
        });

        console.log(
          "CONFIRM EMAIL SENT"
        );

      } catch (emailError) {

        console.error(
          "CONFIRM EMAIL ERROR =",
          emailError
        );

        return NextResponse.json({
          success: true,
          warning:
            "ยืนยันการรับเงินแล้ว แต่ส่งอีเมลแจ้งลูกค้าไม่สำเร็จ",
          emailError:
            emailError instanceof Error
              ? emailError.message
              : String(emailError),
          order: updatedOrder,
        });
      }
    }
    // =========================================
    // ถ้า CANCEL
    // ส่งอีเมลแจ้งลูกค้าว่าคำสั่งซื้อถูกยกเลิก
    // =========================================
    if (action === "cancel") {

      try {

        const customerEmail =
          String(order.email ?? "").trim();

        if (!customerEmail) {
          throw new Error(
            "ไม่พบอีเมลของลูกค้า"
          );
        }

        const customerName =
          `${order.first_name ?? ""} ${order.last_name ?? ""}`.trim();

        const emailResult =
          await resend.emails.send({

            from: FROM_EMAIL,

            to: customerEmail,

            subject:
              `❌ แจ้งยกเลิกคำสั่งซื้อ — ${order.order_code}`,

            html: `
              <div
                style="
                  font-family: Arial, sans-serif;
                  line-height: 1.8;
                  color: #222;
                  max-width: 680px;
                  margin: auto;
                  padding: 20px;
                "
              >

                <div
                  style="
                    background:#14532d;
                    color:white;
                    padding:30px;
                    border-radius:18px;
                    text-align:center;
                  "
                >

                  <h1 style="margin:0;">
                    Laklai View Coffee
                  </h1>

                  <p style="margin-bottom:0;">
                    แจ้งสถานะคำสั่งซื้อ
                  </p>

                </div>

                <div
                  style="
                    background:#f5f5f4;
                    margin-top:20px;
                    padding:30px;
                    border-radius:18px;
                  "
                >

                  <h2 style="color:#991b1b;">
                    ❌ คำสั่งซื้อถูกยกเลิกแล้ว
                  </h2>

                  <p>
                    สวัสดีคุณ
                    <strong>
                      ${escapeHtml(customerName)}
                    </strong>
                  </p>

                  <p>
                    ทาง Laklai View Coffee
                    ขอแจ้งให้ทราบว่า
                    คำสั่งซื้อของคุณถูกยกเลิกเรียบร้อยแล้ว
                  </p>

                  <hr />

                  <h3>
                    รายละเอียดคำสั่งซื้อ
                  </h3>

                  <p>
                    <strong>
                      เลขที่คำสั่งซื้อ:
                    </strong>
                    ${escapeHtml(order.order_code)}
                  </p>

                  <p>
                    <strong>
                      ยอดคำสั่งซื้อ:
                    </strong>
                    ฿${Number(
                      order.total_price || 0
                    ).toLocaleString("th-TH")}
                  </p>

                  <p>
                    <strong>
                      สถานะ:
                    </strong>

                    <span style="color:#991b1b;">
                      ยกเลิกแล้ว
                    </span>
                  </p>

                  <div
                    style="
                      background:#fee2e2;
                      border:1px solid #fecaca;
                      color:#991b1b;
                      padding:20px;
                      border-radius:12px;
                      margin-top:25px;
                      text-align:center;
                    "
                  >

                    <strong>
                      คำสั่งซื้อ
                      ${escapeHtml(order.order_code)}
                      ถูกยกเลิกแล้ว
                    </strong>

                  </div>

                  <p style="margin-top:30px;">
                    หากมีข้อสงสัยเกี่ยวกับคำสั่งซื้อนี้
                    กรุณาติดต่อ Laklai View Coffee
                  </p>

                  <p>
                    ขอบคุณที่เลือก
                    <strong>
                      Laklai View Coffee ❤️
                    </strong>
                  </p>

                </div>

              </div>
            `,
          });

        console.log(
          "CANCEL EMAIL SENT =",
          emailResult
        );

        if (emailResult.error) {
          throw new Error(
            emailResult.error.message
          );
        }

      } catch (emailError) {

        console.error(
          "CANCEL EMAIL ERROR =",
          emailError
        );

        return NextResponse.json({
          success: true,

          warning:
            "ยกเลิกคำสั่งซื้อแล้ว แต่ส่งอีเมลแจ้งลูกค้าไม่สำเร็จ",

          emailError:
            emailError instanceof Error
              ? emailError.message
              : String(emailError),

          order: updatedOrder,
        });
      }
    }
    // =========================================
    // สำเร็จ
    // =========================================
    return NextResponse.json({
      success: true,

      message:
        action === "confirm"
          ? "ยืนยันการรับเงินเรียบร้อยแล้ว และส่งอีเมลให้ลูกค้าแล้ว"
          : action === "reject"
          ? "แจ้งให้ลูกค้าส่งสลิปใหม่เรียบร้อยแล้ว และส่งอีเมลให้ลูกค้าแล้ว"
          : "ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว",

      order: updatedOrder,
    });

  } catch (error) {

    console.error(
      "COFFEE ORDER PATCH ERROR =",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "เกิดข้อผิดพลาดในการเปลี่ยนสถานะคำสั่งซื้อ",
      },
      { status: 500 }
    );
  }
}