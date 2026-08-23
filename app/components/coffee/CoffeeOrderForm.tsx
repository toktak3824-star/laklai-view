"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Variety =
  | "arabica"
  | "robusta";

type RoastLevel =
  | "light"
  | "medium"
  | "dark";

type SizeGrams =
  | "250"
  | "500"
  | "1000";

type GrindType =
  | "whole_bean"
  | "drip"
  | "espresso"
  | "moka";

type CoffeeOrderFormProps = {
  variety: Variety;
  roastLevel: RoastLevel;
  sizeGrams: SizeGrams;
  grindType: GrindType;

  unitPrice: number;

  beanName: string;
  beanThaiName: string;

  roastName: string;
  roastEnglish: string;

  tastingNotes: string;
};

const SHIPPING_FEE = 50;

function formatPrice(price: number) {
  return `฿${price.toLocaleString("th-TH")}`;
}

const grindNames: Record<
  GrindType,
  string
> = {
  whole_bean: "ไม่บด — เมล็ดเต็ม",
  drip: "บดดริป",
  espresso: "บดเอสเพรสโซ่",
  moka: "บดโมก้าพอต",
};

export default function CoffeeOrderForm({
  variety,
  roastLevel,
  sizeGrams,
  grindType,
  unitPrice,
  beanName,
  beanThaiName,
  roastName,
  roastEnglish,
  tastingNotes,
}: CoffeeOrderFormProps) {

  const router = useRouter();

  const [quantity, setQuantity] =
    useState(1);

  const [firstName, setFirstName] =
    useState("");

  const [lastName, setLastName] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [address, setAddress] =
    useState("");

  const [subdistrict, setSubdistrict] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [province, setProvince] =
    useState("");

  const [postalCode, setPostalCode] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");


  /*
  |--------------------------------------------------------------------------
  | PRICE
  |--------------------------------------------------------------------------
  */

  const productTotal =
    unitPrice * quantity;

  const totalPrice =
    productTotal + SHIPPING_FEE;


  /*
  |--------------------------------------------------------------------------
  | SUBMIT
  |--------------------------------------------------------------------------
  */

  async function handleSubmit(
    e: React.FormEvent
  ) {

    e.preventDefault();

    setError("");


    if (!firstName.trim()) {
      setError("กรุณากรอกชื่อ");
      return;
    }

    if (!lastName.trim()) {
      setError("กรุณากรอกนามสกุล");
      return;
    }

    if (!phone.trim()) {
      setError("กรุณากรอกเบอร์โทรศัพท์");
      return;
    }

    if (!email.trim()) {
      setError("กรุณากรอกอีเมล");
      return;
    }

    if (!address.trim()) {
      setError(
        "กรุณากรอกที่อยู่โดยละเอียด"
      );
      return;
    }

    if (!province.trim()) {
      setError("กรุณากรอกจังหวัด");
      return;
    }

    if (!postalCode.trim()) {
      setError("กรุณากรอกรหัสไปรษณีย์");
      return;
    }


    try {

      setLoading(true);


      const response = await fetch(
        "/api/coffee-orders",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({

            firstName,
            lastName,
            phone,
            email,

            address,
            subdistrict,
            district,
            province,
            postalCode,

            items: [
              {
                variety,

                roastLevel,

                sizeGrams,

                grindType,

                quantity,
              },
            ],

          }),
        }
      );


      const data =
        await response.json();


      if (!response.ok) {

        throw new Error(
          data.error ||
            "ไม่สามารถสร้างคำสั่งซื้อได้"
        );

      }


      console.log(
        "COFFEE ORDER CREATED =",
        data
      );


      /*
       * เมื่อสร้าง Order สำเร็จ
       * ไปหน้าชำระเงิน
       */

      router.push(
        `/coffee/payment/${data.orderCode}`
      );


    } catch (err) {

      console.error(
        "COFFEE ORDER SUBMIT ERROR =",
        err
      );


      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่"
      );


    } finally {

      setLoading(false);

    }

  }


  return (

    <section
      id="coffee-order"
      className="mx-auto max-w-6xl scroll-mt-20 px-6 py-20 sm:px-10"
    >

      <div className="rounded-[2rem] bg-[#20251f] p-6 shadow-xl sm:p-10">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="max-w-3xl">

          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Laklai View Coffee
          </p>

          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">
            กาแฟที่คุณเลือก
          </h2>

          <p className="mt-4 leading-8 text-stone-300">

            ระบบนำข้อมูลจากตัวเลือกด้านบนมาให้แล้ว
            คุณไม่ต้องเลือกกาแฟซ้ำอีกครั้ง
            เหลือเพียงเลือกจำนวนถุง
            และกรอกข้อมูลสำหรับจัดส่ง

          </p>

        </div>


        {/* =================================================
            SELECTED COFFEE
        ================================================= */}

        <div className="mt-10 overflow-hidden rounded-3xl border border-emerald-900/60 bg-[#171b16]">

          <div className="p-6 sm:p-8">


            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
              Your Coffee
            </p>


            <h3 className="mt-3 text-2xl font-semibold text-white sm:text-3xl">
              {beanThaiName}
            </h3>


            <p className="mt-2 text-stone-400">
              {beanName}
            </p>


            {/* DETAILS */}

            <div className="mt-8 grid gap-4 sm:grid-cols-2">

              <div className="rounded-2xl border border-white/10 bg-[#20251f] p-5">

                <p className="text-sm text-stone-500">
                  สายพันธุ์
                </p>

                <p className="mt-2 font-semibold text-white">
                  {beanName}
                </p>

              </div>


              <div className="rounded-2xl border border-white/10 bg-[#20251f] p-5">

                <p className="text-sm text-stone-500">
                  ระดับการคั่ว
                </p>

                <p className="mt-2 font-semibold text-white">
                  {roastName}
                </p>

                <p className="mt-1 text-sm text-emerald-400">
                  {roastEnglish}
                </p>

              </div>


              <div className="rounded-2xl border border-white/10 bg-[#20251f] p-5">

                <p className="text-sm text-stone-500">
                  ขนาด
                </p>

                <p className="mt-2 font-semibold text-white">
                  {sizeGrams} กรัม
                </p>

              </div>


              <div className="rounded-2xl border border-white/10 bg-[#20251f] p-5">

                <p className="text-sm text-stone-500">
                  รูปแบบกาแฟ
                </p>

                <p className="mt-2 font-semibold text-white">
                  {grindNames[grindType]}
                </p>

              </div>

            </div>


            {/* TASTING NOTES */}

            <div className="mt-6 rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-6">

              <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
                Tasting Notes
              </p>

              <p className="mt-4 leading-8 text-stone-200">
                {tastingNotes}
              </p>

            </div>


            {/* PRICE */}

            <div className="mt-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

              <div>

                <p className="text-sm text-stone-500">
                  ราคาต่อถุง
                </p>

                <p className="mt-1 text-3xl font-semibold text-emerald-300">
                  {formatPrice(unitPrice)}
                </p>

              </div>

              <div className="text-sm text-stone-500">
                รายละเอียดนี้มาจากการเลือกด้านบน
              </div>

            </div>

          </div>

        </div>


        {/* =================================================
            QUANTITY ONLY
        ================================================= */}

        <div className="mt-10">

          <label className="block text-lg font-semibold text-white">
            จำนวนถุง
          </label>

          <p className="mt-2 text-sm text-stone-400">
            เลือกจำนวนถุงที่ต้องการสั่ง
          </p>


          <select
            value={quantity}
            onChange={(e) =>
              setQuantity(
                Number(e.target.value)
              )
            }
            className="mt-4 w-full rounded-xl border border-white/10 bg-[#171b16] px-4 py-4 text-white outline-none focus:border-emerald-500 sm:max-w-md"
          >

            {Array.from(
              { length: 10 },
              (_, index) => index + 1
            ).map((number) => (

              <option
                key={number}
                value={number}
              >
                {number} ถุง
              </option>

            ))}

          </select>

        </div>


        {/* =================================================
            PRICE SUMMARY
        ================================================= */}

        <div className="mt-8 rounded-2xl border border-emerald-900/60 bg-emerald-950/40 p-6">

          <div className="flex flex-col gap-3 text-stone-300 sm:flex-row sm:items-center sm:justify-between">

            <span>
              ราคาต่อถุง
            </span>

            <strong className="text-xl text-white">
              {formatPrice(unitPrice)}
            </strong>

          </div>


          <div className="mt-3 flex justify-between text-stone-300">

            <span>
              จำนวน
            </span>

            <span>
              {quantity} ถุง
            </span>

          </div>


          <div className="mt-3 flex justify-between text-stone-300">

            <span>
              ค่าสินค้า
            </span>

            <span>
              {formatPrice(productTotal)}
            </span>

          </div>


          <div className="mt-3 flex justify-between text-stone-300">

            <span>
              ค่าจัดส่ง
            </span>

            <span>
              {formatPrice(SHIPPING_FEE)}
            </span>

          </div>


          <div className="mt-5 border-t border-white/10 pt-5">

            <div className="flex items-center justify-between">

              <span className="text-lg font-semibold text-white">
                ยอดรวม
              </span>

              <span className="text-3xl font-bold text-emerald-400">
                {formatPrice(totalPrice)}
              </span>

            </div>

          </div>

        </div>


        {/* =================================================
            CUSTOMER INFORMATION
        ================================================= */}

        <form
          onSubmit={handleSubmit}
          className="mt-10"
        >

          <h3 className="text-2xl font-semibold text-white">
            ข้อมูลสำหรับจัดส่ง
          </h3>


          <div className="mt-6 grid gap-5 md:grid-cols-2">

            <input
              value={firstName}
              onChange={(e) =>
                setFirstName(
                  e.target.value
                )
              }
              placeholder="ชื่อจริง"
              className="rounded-xl border border-white/10 bg-[#171b16] px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-emerald-500"
            />


            <input
              value={lastName}
              onChange={(e) =>
                setLastName(
                  e.target.value
                )
              }
              placeholder="นามสกุลจริง"
              className="rounded-xl border border-white/10 bg-[#171b16] px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-emerald-500"
            />


            <input
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              placeholder="เบอร์โทรศัพท์"
              type="tel"
              className="rounded-xl border border-white/10 bg-[#171b16] px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-emerald-500"
            />


            <input
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              placeholder="อีเมล"
              type="email"
              className="rounded-xl border border-white/10 bg-[#171b16] px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-emerald-500"
            />

          </div>


          <textarea
            value={address}
            onChange={(e) =>
              setAddress(
                e.target.value
              )
            }
            placeholder="บ้านเลขที่ หมู่ ถนน หรือรายละเอียดที่อยู่สำหรับจัดส่ง"
            rows={4}
            className="mt-5 w-full rounded-xl border border-white/10 bg-[#171b16] px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-emerald-500"
          />


          <div className="mt-5 grid gap-5 md:grid-cols-3">

            <input
              value={subdistrict}
              onChange={(e) =>
                setSubdistrict(
                  e.target.value
                )
              }
              placeholder="ตำบล / แขวง"
              className="rounded-xl border border-white/10 bg-[#171b16] px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-emerald-500"
            />


            <input
              value={district}
              onChange={(e) =>
                setDistrict(
                  e.target.value
                )
              }
              placeholder="อำเภอ / เขต"
              className="rounded-xl border border-white/10 bg-[#171b16] px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-emerald-500"
            />

            <input
              value={province}
              onChange={(e) =>
                setProvince(
                  e.target.value
                )
              }
              placeholder="จังหวัด"
              className="rounded-xl border border-white/10 bg-[#171b16] px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-emerald-500"
            />

          </div>


          <input
            value={postalCode}
            onChange={(e) =>
              setPostalCode(
                e.target.value
              )
            }
            placeholder="รหัสไปรษณีย์"
            inputMode="numeric"
            className="mt-5 w-full rounded-xl border border-white/10 bg-[#171b16] px-4 py-3 text-white placeholder:text-stone-500 outline-none focus:border-emerald-500 md:max-w-xs"
          />


          {/* ERROR */}

          {error && (

            <div className="mt-6 rounded-xl border border-red-900/50 bg-red-950/40 p-4 text-center text-red-300">

              {error}

            </div>

          )}


          {/* =================================================
              PAYMENT BUTTON
          ================================================= */}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 w-full rounded-full bg-emerald-700 px-8 py-4 text-lg font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >

            {loading
              ? "กำลังสร้างคำสั่งซื้อ..."
              : `ไปหน้าชำระเงิน — ${formatPrice(
                  totalPrice
                )}`}

          </button>


          <p className="mt-4 text-center text-sm leading-7 text-stone-500">

            ตรวจสอบข้อมูลและยอดชำระก่อนดำเนินการต่อ

          </p>

        </form>

      </div>

    </section>

  );
}