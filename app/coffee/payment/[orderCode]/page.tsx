import Image from "next/image";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CoffeeSlipUpload from "../../../components/coffee/CoffeeSlipUpload";

type PageProps = {
  params: Promise<{
    orderCode: string;
  }>;
};

function formatPrice(price: number) {
  return `฿${Number(price).toLocaleString("th-TH")}`;
}

function getVarietyName(variety: string) {
  switch (variety) {
    case "arabica":
      return "Arabica — อาราบิก้า";
    case "robusta":
      return "Robusta — โรบัสต้า";
    default:
      return variety;
  }
}

function getRoastName(roast: string) {
  switch (roast) {
    case "light":
      return "คั่วอ่อน — Light Roast";
    case "medium":
      return "คั่วกลาง — Medium Roast";
    case "dark":
      return "คั่วเข้ม — Dark Roast";
    default:
      return roast;
  }
}

function getGrindName(grind: string) {
  switch (grind) {
    case "whole_bean":
      return "เมล็ดเต็ม — ไม่บด";
    case "drip":
      return "บดดริป";
    case "espresso":
      return "บดเอสเพรสโซ่";
    case "moka":
      return "บดโมก้าพอต";
    default:
      return grind;
  }
}

export default async function CoffeePaymentPage({
  params,
}: PageProps) {
  const { orderCode } = await params;

  if (!orderCode) {
    notFound();
  }

  // =========================================
  // ค้นหาคำสั่งซื้อกาแฟ
  // =========================================

  const { data: order, error } = await supabaseAdmin
    .from("coffee_orders")
    .select("*")
    .eq("order_code", orderCode)
    .single();

  if (error || !order) {
    console.error(
      "COFFEE PAYMENT ORDER ERROR =",
      error
    );

    notFound();
  }

  const orderItems = Array.isArray(order.order_items)
    ? order.order_items
    : [];

  return (
    <main className="min-h-screen bg-[#171b16] px-4 py-10 text-white sm:px-6 lg:px-10">

      <div className="mx-auto max-w-5xl">

        {/* =========================================
            HEADER
        ========================================= */}

        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-950 via-[#20251f] to-[#111511] p-7 shadow-2xl sm:p-10">

          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
            Laklai View Coffee
          </p>

          <h1 className="mt-4 text-3xl font-semibold sm:text-5xl">
            ชำระเงินค่าสินค้า
          </h1>

          <p className="mt-4 leading-8 text-stone-300">
            กรุณาตรวจสอบรายละเอียดคำสั่งซื้อ
            และชำระเงินตามยอดที่ระบุด้านล่าง
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">

            <p className="text-sm text-stone-400">
              Order Code
            </p>

            <p className="mt-2 text-2xl font-bold tracking-wider text-emerald-300">
              {order.order_code}
            </p>

          </div>

        </section>


        {/* =========================================
            ORDER DETAIL
        ========================================= */}

        <section className="mt-8 rounded-[2rem] bg-white p-6 text-stone-800 shadow-xl sm:p-10">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

            <div>

              <p className="text-sm uppercase tracking-[0.25em] text-emerald-700">
                Order Summary
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                รายละเอียดคำสั่งซื้อ
              </h2>

            </div>

            <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
              รอการชำระเงิน
            </div>

          </div>


          {/* Customer */}

          <div className="mt-8 grid gap-5 border-b border-stone-200 pb-8 md:grid-cols-2">

            <div>
              <p className="text-sm text-stone-500">
                ชื่อผู้สั่งซื้อ
              </p>

              <p className="mt-1 font-semibold">
                {order.first_name} {order.last_name}
              </p>
            </div>

            <div>
              <p className="text-sm text-stone-500">
                เบอร์โทรศัพท์
              </p>

              <p className="mt-1 font-semibold">
                {order.phone}
              </p>
            </div>

            <div className="md:col-span-2">
              <p className="text-sm text-stone-500">
                อีเมล
              </p>

              <p className="mt-1 break-all font-semibold">
                {order.email}
              </p>
            </div>

            <div className="md:col-span-2">

              <p className="text-sm text-stone-500">
                ที่อยู่จัดส่ง
              </p>

              <p className="mt-1 leading-7">
                {order.address}
                <br />

                {order.subdistrict &&
                  `ตำบล/แขวง ${order.subdistrict} `}

                {order.district &&
                  `อำเภอ/เขต ${order.district} `}

                {order.province &&
                  `จังหวัด${order.province} `}

                {order.postal_code}
              </p>

            </div>

          </div>


          {/* Products */}

          <div className="mt-8 space-y-4">

            <h3 className="text-xl font-bold">
              รายการกาแฟ
            </h3>

            {orderItems.map(
              (
                item: {
                  variety: string;
                  roast_level: string;
                  size_grams: number;
                  grind_type: string;
                  quantity: number;
                  unit_price: number;
                },
                index: number
              ) => (

                <div
                  key={`${item.variety}-${item.roast_level}-${item.size_grams}-${index}`}
                  className="rounded-2xl border border-stone-200 bg-stone-50 p-5"
                >

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>

                      <p className="text-xl font-bold">
                        {getVarietyName(item.variety)}
                      </p>

                      <div className="mt-2 space-y-1 text-sm text-stone-600">

                        <p>
                          {getRoastName(item.roast_level)}
                        </p>

                        <p>
                          ขนาด {item.size_grams.toLocaleString("th-TH")} กรัม
                        </p>

                        <p>
                          {getGrindName(item.grind_type)}
                        </p>

                        <p>
                          จำนวน {item.quantity} ถุง
                        </p>

                      </div>

                    </div>

                    <div className="text-left sm:text-right">

                      <p className="text-sm text-stone-500">
                        ราคาต่อถุง
                      </p>

                      <p className="text-xl font-bold text-emerald-700">
                        {formatPrice(item.unit_price)}
                      </p>

                      <p className="mt-1 text-sm text-stone-500">
                        รวม{" "}
                        {formatPrice(
                          item.unit_price *
                            item.quantity
                        )}
                      </p>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>


          {/* Total */}

          <div className="mt-8 rounded-3xl bg-emerald-50 p-6">

            <div className="flex items-center justify-between gap-4">

              <span className="text-stone-600">
                ค่าสินค้า
              </span>

              <span className="font-semibold">
                {formatPrice(
                  Number(order.total_price) -
                    Number(order.shipping_fee)
                )}
              </span>

            </div>

            <div className="mt-3 flex items-center justify-between gap-4">

              <span className="text-stone-600">
                ค่าจัดส่ง
              </span>

              <span className="font-semibold">
                {formatPrice(
                  Number(order.shipping_fee)
                )}
              </span>

            </div>

            <div className="mt-5 border-t border-emerald-200 pt-5">

              <div className="flex items-end justify-between gap-4">

                <span className="text-lg font-bold text-emerald-800">
                  ยอดที่ต้องชำระทั้งหมด
                </span>

                <span className="text-4xl font-bold text-emerald-700">
                  {formatPrice(
                    Number(order.total_price)
                  )}
                </span>

              </div>

            </div>

          </div>

        </section>


        {/* =========================================
            PAYMENT
        ========================================= */}

        <section className="mt-8 rounded-[2rem] bg-white p-6 text-stone-800 shadow-xl sm:p-10">

          <p className="text-sm uppercase tracking-[0.25em] text-emerald-700">
            Payment
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            ช่องทางการชำระเงิน
          </h2>

          <p className="mt-4 leading-8 text-stone-600">
            กรุณาชำระเงินตามยอดรวมที่แสดงด้านบน
            จากนั้นแนบสลิปเพื่อยืนยันคำสั่งซื้อ
          </p>


          {/* ttb */}

          <div className="mt-8 rounded-3xl border border-stone-200 p-6">

            <h3 className="text-xl font-bold">
              PromptPay ร้านค้า
            </h3>

            <p className="mt-1 text-sm text-stone-500">
              ธนาคาร ttb
            </p>

            <div className="mt-6 flex justify-center">

              <Image
                src="/payment/promptpay-ttb.jpg"
                alt="QR Code สำหรับชำระเงิน Laklai View Coffee"
                width={350}
                height={350}
                className="rounded-2xl border border-stone-200"
              />

            </div>

            <p className="mt-5 text-center text-sm text-stone-500">
              สแกน QR Code ด้วย Mobile Banking
            </p>

          </div>


          {/* TrueMoney */}

          <div className="mt-6 rounded-3xl border border-stone-200 p-6">

            <h3 className="text-xl font-bold">
              TrueMoney Wallet
            </h3>

            <div className="mt-6 flex justify-center">

              <Image
                src="/payment/truemoney.jpg"
                alt="QR Code TrueMoney Wallet"
                width={350}
                height={350}
                className="rounded-2xl border border-stone-200"
              />

            </div>

            <p className="mt-5 text-center text-sm text-stone-500">
              รองรับการชำระผ่าน TrueMoney Wallet
            </p>

          </div>

        </section>


        {/* =========================================
            IMPORTANT
        ========================================= */}

        <section className="mt-8 rounded-3xl border border-amber-700/30 bg-amber-950/30 p-6 text-amber-100">

          <h2 className="text-xl font-bold">
            สำคัญก่อนส่งสลิป
          </h2>

          <ul className="mt-4 space-y-2 text-sm leading-7 text-amber-100/80">

            <li>
              • กรุณาตรวจสอบยอดเงินให้ตรงกับยอดที่ต้องชำระ
            </li>

            <li>
              • กรุณาโอนเงินตามช่องทางที่แสดงในหน้านี้
            </li>

            <li>
              • หลังจากชำระเงินแล้ว กรุณาแนบสลิปการโอนเงิน
            </li>

            <li>
              • คำสั่งซื้อจะเข้าสู่ขั้นตอนตรวจสอบหลังจากได้รับสลิป
            </li>

          </ul>

        </section>

        {/* =========================================
            SLIP
            ========================================= */}

<section className="mt-8 rounded-[2rem] bg-white p-6 text-stone-800 shadow-xl sm:p-10">

  <p className="text-sm uppercase tracking-[0.25em] text-emerald-700">
    Payment Confirmation
  </p>

  <h2 className="mt-2 text-3xl font-bold">
    แนบสลิปการชำระเงิน
  </h2>

  <p className="mt-4 leading-8 text-stone-600">
    เมื่อชำระเงินเรียบร้อยแล้ว
    กรุณาแนบภาพสลิปการโอนเงินเพื่อยืนยันคำสั่งซื้อ
  </p>

  <div className="mt-6">
    <CoffeeSlipUpload
      orderCode={orderCode}
    />
  </div>

</section>

        {/* =========================================
            FOOTER
        ========================================= */}

        <section className="py-12 text-center">

          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Laklai View Coffee
          </p>

          <p className="mt-3 text-stone-400">
            ขอบคุณที่เลือกพารสชาติของหลักลายกลับบ้าน
          </p>

        </section>

      </div>

    </main>
  );
}