"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import CoffeeOrderForm from "../components/coffee/CoffeeOrderForm";

type BeanType = "arabica" | "robusta";
type RoastType = "light" | "medium" | "dark";
type SizeType = "250" | "500" | "1000";
type GrindType = "whole" | "drip" | "espresso" | "moka";

const beans = {
  arabica: {
    name: "Arabica 100%",
    thaiName: "อาราบิก้า ดอยสวนยาหลวง",
    origin: "ดอยสวนยาหลวง จังหวัดน่าน",
    altitude: "1,100–1,500 m.",
    process:
      "Washed Process สำหรับคั่วอ่อน และ Dry Process สำหรับคั่วกลางและคั่วเข้ม",
    varieties:
      "Hybrid de Timor, Catimor, Caturra, Typica, Bourbon, Yellow",
    image: "/images/coffee/arabica-medium.jpg",
    description:
      'เมล็ดกาแฟคั่ว "หลักลาย View" จากน่าน อาราบิก้า 100% จากดอยสวนยาหลวง',
  },

  robusta: {
    name: "Robusta 100%",
    thaiName: "โรบัสต้า บ้านสันเจริญ",
    origin: "บ้านสันเจริญ ดอยสวนยาหลวง จังหวัดน่าน",
    altitude: "700–1,200 m.",
    process:
      "Washed Process สำหรับคั่วอ่อนและคั่วกลาง / Dry Process สำหรับคั่วเข้ม",
    varieties: "Robusta (Coffea Canephora)",
    image: "/images/coffee/robusta.jpg",
    description:
      'เมล็ดกาแฟคั่ว "หลักลาย View" จากน่าน โรบัสต้า 100% จากบ้านสันเจริญ ดอยสวนยาหลวง',
  },
};

const roastInfo = {
  arabica: {
    light: {
      name: "คั่วอ่อน",
      english: "Light Roast",
      tastingNotes:
        "Floral, White Flowers, Tea-like body, Bright Acidity, Green Apple, Berry Notes, Peach, Clean",
    },

    medium: {
      name: "คั่วกลาง",
      english: "Medium Roast",
      tastingNotes:
        "Ripe Fruit, Winey, Clean & Smooth, Stone Fruit, Apricot, Caramel Creamy, Brown Sugar",
    },

    dark: {
      name: "คั่วเข้ม",
      english: "Dark Roast",
      tastingNotes:
        "Chocolate, Nutty, Smoked Bark, Balance, Sweet Late",
    },
  },

  robusta: {
    light: {
      name: "คั่วอ่อน",
      english: "Light Roast",
      tastingNotes:
        "Cereal, Honey, Molasses, Tropical Fruit, Dried Prunes, Fresh, The Sourness of Slightly Ripe Fruit, Clean",
    },

    medium: {
      name: "คั่วกลาง",
      english: "Medium Roast",
      tastingNotes:
        "Roasted Peanut, Cashew Nut, Brown Sugar, Black Tea, Clean & Smooth & Balanced, Caramel",
    },

    dark: {
      name: "คั่วเข้ม",
      english: "Dark Roast",
      tastingNotes:
        "Chocolate, Cocoa Nibs, Caramelized Sugar, Nutty Hazelnut, Cereal, Malt, Smoky, Clean",
    },
  },
};

// รูปภาพจริงที่อยู่ใน public/images/coffee
const coffeeImages: Record<BeanType, Record<RoastType, string>> = {
  arabica: {
    light: "/images/coffee/arabica-light.jpg",
    medium: "/images/coffee/arabica-medium.jpg",
    dark: "/images/coffee/arabica-dark.jpg",
  },
  // ตอนนี้มีรูป Robusta เพียงรูปเดียว จึงใช้ร่วมกันทั้ง 3 ระดับการคั่ว
  robusta: {
    light: "/images/coffee/coffee-shop16.jpg",
    medium: "/images/coffee/coffee-shop15.jpg",
    dark: "/images/coffee/robusta.jpg",
  },
};

const grindOptions = [
  {
    id: "whole" as GrindType,
    name: "ไม่บด",
    description: "เมล็ดกาแฟเต็มเมล็ด",
  },
  {
    id: "drip" as GrindType,
    name: "บดดริป",
    description: "เหมาะสำหรับกาแฟดริป",
  },
  {
    id: "espresso" as GrindType,
    name: "บดเอสเพรสโซ่",
    description: "เหมาะสำหรับเครื่องเอสเพรสโซ่",
  },
  {
    id: "moka" as GrindType,
    name: "บดโมก้าพอต",
    description: "เหมาะสำหรับ Moka Pot",
  },
];

/*
|--------------------------------------------------------------------------
| ราคา
|--------------------------------------------------------------------------
| ตอนนี้ราคาแยกตาม:
| สายพันธุ์ / ระดับคั่ว / ขนาด / รูปแบบ
|
| หมายเหตุ:
| รูปแบบบดทั้งหมดที่ไม่ใช่ "ไม่บด"
| ใช้ราคาบดเดียวกัน
|--------------------------------------------------------------------------
*/

const productPrices = {
  arabica: {
    light: {
      "250": {
        whole: 209,
        ground: 220,
      },
      "500": {
        whole: 390,
        ground: 409,
      },
      "1000": {
        whole: 779,
        ground: 789,
      },
    },

    medium: {
      "250": {
        whole: 209,
        ground: 220,
      },
      "500": {
        whole: 390,
        ground: 409,
      },
      "1000": {
        whole: 779,
        ground: 789,
      },
    },

    dark: {
      "250": {
        whole: 209,
        ground: 220,
      },
      "500": {
        whole: 390,
        ground: 409,
      },
      "1000": {
        whole: 779,
        ground: 789,
      },
    },
  },

  robusta: {
    light: {
      "250": {
        whole: 179,
        ground: 190,
      },
      "500": {
        whole: 349,
        ground: 360,
      },
      "1000": {
        whole: 690,
        ground: 709,
      },
    },

    medium: {
      "250": {
        whole: 179,
        ground: 190,
      },
      "500": {
        whole: 349,
        ground: 360,
      },
      "1000": {
        whole: 690,
        ground: 709,
      },
    },

    dark: {
      "250": {
        whole: 179,
        ground: 190,
      },
      "500": {
        whole: 349,
        ground: 360,
      },
      "1000": {
        whole: 690,
        ground: 709,
      },
    },
  },
};

export default function CoffeePage() {
  const [beanType, setBeanType] =
    useState<BeanType>("arabica");

  const [roast, setRoast] =
    useState<RoastType>("light");

  const [size, setSize] =
    useState<SizeType>("250");

  const [grind, setGrind] =
    useState<GrindType>("whole");

  const selectedBean = beans[beanType];

  const selectedRoast =
    roastInfo[beanType][roast];

  const selectedGrind =
    grindOptions.find(
      (item) => item.id === grind
    );

  const selectedCoffeeImage = coffeeImages[beanType][roast];

  const price = useMemo(() => {
    const selectedPrice =
      productPrices[beanType][roast][size];

    return grind === "whole"
      ? selectedPrice.whole
      : selectedPrice.ground;
  }, [
    beanType,
    roast,
    size,
    grind,
  ]);

  const displayPrice =
    price.toLocaleString("th-TH");

  function goToOrder() {
    document
      .getElementById("coffee-order")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
  }

  return (
    <main className="min-h-screen bg-[#171b16] text-white">

      {/* =====================================================
          1. HERO
      ===================================================== */}

      <section className="relative overflow-hidden">

        <Image
          src="/images/coffee/coffee-shop.jpg"
          alt="Laklai View Coffee Shop"
          fill
          priority
          className="object-cover object-center"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-[#06130d]/80 via-[#0d2119]/75 to-[#171b16]" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-end px-6 pb-20 pt-32 sm:px-10 lg:px-16">

          <div className="max-w-4xl">

            <p className="mb-5 text-sm font-medium uppercase tracking-[0.35em] text-emerald-300">
              Laklai View Coffee
            </p>

            <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
              กาแฟจากหลักลาย View
            </h1>

            <p className="mt-5 max-w-2xl text-xl font-light leading-9 text-stone-200 sm:text-2xl">
              รสชาติจากภูเขาน่าน
              <br />
              ที่เราอยากให้คุณพากลับไปที่บ้าน
            </p>

            <p className="mt-6 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
              นอกจากการพักผ่อนท่ามกลางธรรมชาติ
              หลักลาย View ยังมีเมล็ดกาแฟของเราเอง
              จากแหล่งปลูกในจังหวัดน่าน
              ให้คุณเลือกทั้งสายพันธุ์ ระดับการคั่ว
              ขนาด และรูปแบบการบด
            </p>

            <div className="mt-8 flex flex-wrap gap-4">

              <a
                href="#coffee-shop"
                className="rounded-full bg-emerald-700 px-7 py-3 font-semibold transition hover:bg-emerald-600"
              >
                เลือกเมล็ดกาแฟ
              </a>

              <Link
                href="/"
                className="rounded-full border border-white/20 px-7 py-3 font-semibold transition hover:bg-white/10"
              >
                กลับไปดูที่พัก
              </Link>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          2. BRAND STORY
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">

        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">

          <div>

            <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
              From Nan Province
            </p>

            <h2 className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
              จากภูเขาของน่าน
              <br />
              สู่ถ้วยกาแฟของคุณ
            </h2>

          </div>

          <div className="space-y-5 text-base leading-8 text-stone-300 sm:text-lg">

            <p>
              เราตั้งใจนำเสนอเมล็ดกาแฟจากแหล่งปลูกในจังหวัดน่าน
              ผ่านการคั่วในระดับที่แตกต่างกัน
              เพื่อให้แต่ละคนได้เลือกกลิ่นและรสชาติที่เหมาะกับตัวเอง
            </p>

            <p>
              ไม่ว่าคุณจะชอบความหอมแบบดอกไม้
              ความหวานของผลไม้และคาราเมล
              หรือความเข้มของช็อกโกแลตและถั่ว
              เรามีระดับการคั่วให้เลือกตามสไตล์ที่คุณชอบ
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          3. MAIN COFFEE SELECTION
          สายพันธุ์
          ระดับคั่ว
          ขนาด
          รูปแบบบด
      ===================================================== */}

      <section
        id="coffee-shop"
        className="mx-auto max-w-7xl px-6 py-20 sm:px-10"
      >

        <div className="mb-12">

          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            Coffee Beans
          </p>

          <h2 className="mt-4 text-4xl font-semibold sm:text-5xl">
            เลือกกาแฟของคุณ
          </h2>

          <p className="mt-5 max-w-2xl leading-8 text-stone-400">
            เลือกสายพันธุ์ ระดับการคั่ว ขนาด
            และรูปแบบการบดได้ตามที่คุณต้องการ
          </p>

        </div>


        {/* ---------------------------
            BEAN TYPE
        ---------------------------- */}

        <div className="grid gap-6 md:grid-cols-2">

          {(Object.keys(beans) as BeanType[]).map(
            (type) => {

              const bean = beans[type];

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    setBeanType(type)
                  }
                  className={`group overflow-hidden rounded-3xl border text-left transition ${
                    beanType === type
                      ? "border-emerald-500 bg-[#253127]"
                      : "border-white/10 bg-[#20251f] hover:border-emerald-800"
                  }`}
                >

                  <div className="relative min-h-[280px] overflow-hidden">
                    <Image
                      src={
                        type === "arabica"
                          ? "/images/coffee/arabica-medium.jpg"
                          : "/images/coffee/robusta.jpg"
                      }
                      alt={bean.thaiName}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-7">
                      <p className="text-2xl font-semibold text-white">
                        {bean.name}
                      </p>
                      <p className="mt-2 text-emerald-300">
                        {bean.thaiName}
                      </p>
                    </div>
                  </div>

                  <div className="p-7">

                    <p className="text-sm leading-7 text-stone-300">
                      {bean.description}
                    </p>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">

                      <div>

                        <p className="text-stone-500">
                          แหล่งปลูก
                        </p>

                        <p className="mt-1">
                          {bean.origin}
                        </p>

                      </div>

                      <div>

                        <p className="text-stone-500">
                          ระดับความสูง
                        </p>

                        <p className="mt-1">
                          {bean.altitude}
                        </p>

                      </div>

                    </div>

                  </div>

                </button>
              );
            }
          )}

        </div>


        {/* ---------------------------
            ROAST LEVEL
        ---------------------------- */}

        <div className="mt-16">

          <div className="mb-6">

            <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
              Roast Level
            </p>

            <h3 className="mt-3 text-2xl font-semibold">
              เลือกระดับการคั่ว
            </h3>

            <p className="mt-3 text-stone-400">
              {beanType === "arabica"
                ? "Arabica 100% — เลือกระดับการคั่วตามกลิ่นและรสชาติที่คุณชอบ"
                : "Robusta 100% — เลือกระดับการคั่วตามกลิ่นและรสชาติที่คุณชอบ"}
            </p>

          </div>


          <div className="grid gap-4 md:grid-cols-3">

            {(Object.keys(
              roastInfo[beanType]
            ) as RoastType[]).map(
              (type) => {

                const roastItem =
                  roastInfo[beanType][type];

                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() =>
                      setRoast(type)
                    }
                    className={`rounded-2xl border p-6 text-left transition ${
                      roast === type
                        ? "border-emerald-500 bg-emerald-950/40"
                        : "border-white/10 bg-[#20251f] hover:border-emerald-800"
                    }`}
                  >

                    <p className="text-sm text-emerald-400">
                      {roastItem.english}
                    </p>

                    <h4 className="mt-2 text-2xl font-semibold">
                      {roastItem.name}
                    </h4>

                    <p className="mt-4 text-sm leading-7 text-stone-400">
                      {roastItem.tastingNotes}
                    </p>

                  </button>
                );
              }
            )}

          </div>

        </div>


        {/* ---------------------------
            PACKAGE SIZE
        ---------------------------- */}

        <div className="mt-16">

          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
            Package Size
          </p>

          <h3 className="mt-3 text-2xl font-semibold">
            เลือกขนาด
          </h3>

          <div className="mt-6 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">

            {(
              ["250", "500", "1000"] as SizeType[]
            ).map((value) => (

              <button
                key={value}
                type="button"
                onClick={() =>
                  setSize(value)
                }
                className={`rounded-2xl border py-5 text-center transition ${
                  size === value
                    ? "border-emerald-500 bg-emerald-950/40"
                    : "border-white/10 bg-[#20251f] hover:border-emerald-800"
                }`}
              >

                <span className="text-2xl font-semibold">
                  {value}
                </span>

                <span className="ml-2 text-stone-400">
                  กรัม
                </span>

              </button>

            ))}

          </div>

        </div>


        {/* ---------------------------
            GRIND
        ---------------------------- */}

        <div className="mt-16">

          <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
            Grind
          </p>

          <h3 className="mt-3 text-2xl font-semibold">
            เลือกรูปแบบกาแฟ
          </h3>

          <p className="mt-3 text-stone-400">
            เลือกให้เหมาะกับวิธีชงที่คุณใช้
          </p>


          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {grindOptions.map(
              (option) => (

                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setGrind(option.id)
                  }
                  className={`rounded-2xl border p-6 text-left transition ${
                    grind === option.id
                      ? "border-emerald-500 bg-emerald-950/40"
                      : "border-white/10 bg-[#20251f] hover:border-emerald-800"
                  }`}
                >

                  <h4 className="text-lg font-semibold">
                    {option.name}
                  </h4>

                  <p className="mt-3 text-sm leading-6 text-stone-400">
                    {option.description}
                  </p>

                </button>

              )
            )}

          </div>

        </div>


        {/* =================================================
            YOUR SELECTION
            ข้อมูลจะเปลี่ยนทันทีตามที่เลือกด้านบน
        ================================================= */}

        <div className="mt-16 overflow-hidden rounded-[2rem] border border-white/10 bg-[#20251f]">

          <div className="grid lg:grid-cols-2">

            {/* LEFT */}

            <div className="relative min-h-[480px] overflow-hidden">
              <Image
                src={selectedCoffeeImage}
                alt={`${selectedBean.thaiName} ${selectedRoast.name}`}
                fill
                className="object-cover object-center transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

              <div className="absolute inset-x-0 bottom-0 p-10 sm:p-12">
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">
                  Laklai View Coffee
                </p>

                <h3 className="mt-3 text-3xl font-semibold text-white">
                  {selectedBean.name}
                </h3>

                <p className="mt-2 text-stone-200">
                  {selectedBean.thaiName} · {selectedRoast.name}
                </p>
              </div>
            </div>


            {/* RIGHT */}

            <div className="p-8 sm:p-12">

              <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
                Your Selection
              </p>

              <h3 className="mt-4 text-3xl font-semibold">
                {selectedBean.thaiName}
              </h3>


              <div className="mt-8 space-y-4">

                <div className="flex justify-between border-b border-white/10 pb-4">

                  <span className="text-stone-500">
                    สายพันธุ์
                  </span>

                  <span>
                    {selectedBean.name}
                  </span>

                </div>


                <div className="flex justify-between border-b border-white/10 pb-4">

                  <span className="text-stone-500">
                    ระดับการคั่ว
                  </span>

                  <span>
                    {selectedRoast.name}
                  </span>

                </div>


                <div className="flex justify-between border-b border-white/10 pb-4">

                  <span className="text-stone-500">
                    ขนาด
                  </span>

                  <span>
                    {size} g
                  </span>

                </div>


                <div className="flex justify-between border-b border-white/10 pb-4">

                  <span className="text-stone-500">
                    รูปแบบ
                  </span>

                  <span>
                    {selectedGrind?.name}
                  </span>

                </div>

              </div>


              {/* TASTING NOTES */}

              <div className="mt-8 rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-6">

                <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
                  Tasting Notes
                </p>

                <p className="mt-4 leading-8 text-stone-200">
                  {selectedRoast.tastingNotes}
                </p>

              </div>


              {/* PRICE */}

              <div className="mt-8">

                <p className="text-sm text-stone-500">
                  ราคาต่อถุง
                </p>

                <p className="mt-2 text-4xl font-semibold text-emerald-300">
                  ฿{displayPrice}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
    COFFEE GALLERY
    Gallery เรื่องราวของกาแฟและหลักลาย View
===================================================== */}

<section className="mx-auto max-w-7xl px-6 pb-24 sm:px-10">

  <div className="mb-10">
    <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
      Laklai View Coffee Gallery
    </p>

    <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
      จากเมล็ดกาแฟ
      <br className="sm:hidden" />
      สู่บรรยากาศของหลักลาย View
    </h2>

    <p className="mt-5 max-w-2xl leading-8 text-stone-400">
      เรื่องราวของกาแฟจากน่าน
      ตั้งแต่เมล็ดกาแฟ ผลกาแฟ
      ไปจนถึงช่วงเวลาที่เราอยากให้คุณได้สัมผัสที่หลักลาย View
    </p>
  </div>

  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">

    {[
      {
        src: "/images/coffee/coffee-shop.jpg",
        alt: "Laklai View Coffee Shop",
        className: "col-span-2 row-span-2",
      },

      {
        src: "/images/coffee/coffee-shop2.jpg",
        alt: "บรรยากาศยามเช้าที่หลักลาย View",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop3.jpg",
        alt: "กาแฟและวิวภูเขา",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop4.jpg",
        alt: "วิวภูเขาจากหลักลาย View",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop5.jpg",
        alt: "มุมพักผ่อนท่ามกลางธรรมชาติ",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop6.jpg",
        alt: "บรรยากาศรอบร้านกาแฟ",
        className: "col-span-2",
      },

      {
        src: "/images/coffee/coffee-shop7.jpg",
        alt: "ช่วงเวลาของกาแฟ",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop8.jpg",
        alt: "มุมกาแฟของหลักลาย View",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop9.jpg",
        alt: "เรื่องราวของกาแฟหลักลาย View",
        className: "col-span-2",
      },

      {
        src: "/images/coffee/coffee-shop10.jpg",
        alt: "ดอกกาแฟ",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop11.jpg",
        alt: "เมล็ดกาแฟ",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop12.jpg",
        alt: "ผลกาแฟสีเขียว",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop13.jpg",
        alt: "ผลกาแฟบนต้น",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop14.jpg",
        alt: "เมล็ดกาแฟ",
        className: "col-span-2",
      },

      {
        src: "/images/coffee/coffee-shop15.jpg",
        alt: "ผลิตภัณฑ์กาแฟหลักลาย View",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop16.jpg",
        alt: "กาแฟคั่วหลักลาย View",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop17.jpg",
        alt: "ผลิตภัณฑ์จากกาแฟ",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop18.jpg",
        alt: "กาแฟจากหลักลาย View",
        className: "col-span-1",
      },

      {
        src: "/images/coffee/coffee-shop19.jpg",
        alt: "กาแฟที่อยากให้คุณลอง",
        className: "col-span-2",
      },

      {
        src: "/images/gallery/gallery3.jpg",
        alt: "บรรยากาศหลักลาย View",
        className: "col-span-2",
      },

    ].map((image) => (
      <div
        key={image.src}
        className={`${image.className} group relative min-h-[180px] overflow-hidden rounded-3xl border border-white/10 bg-[#20251f] sm:min-h-[220px]`}
      >

        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />

        <p className="absolute bottom-4 left-4 right-4 text-sm font-medium text-white sm:bottom-5 sm:left-5">
          {image.alt}
        </p>

      </div>
    ))}

  </div>

</section>

      {/* =====================================================
          4. ABOUT THE BEANS
          ห้ามลบ
      ===================================================== */}

      <section className="mx-auto max-w-6xl px-6 py-20 sm:px-10">

        <div className="border-t border-white/10 pt-16">

          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
            About The Beans
          </p>

          <h2 className="mt-4 text-3xl font-semibold">
            รู้จักกาแฟก่อนเลือกซื้อ
          </h2>

          <p className="mt-4 max-w-4xl leading-8 text-stone-300">

            เมล็ดกาแฟแต่ละสายพันธุ์ เมื่อผ่านระดับการคั่วที่แตกต่างกัน
            จะให้กลิ่น รสชาติ และสัมผัสที่แตกต่างกัน
            เลือกตามรสชาติที่คุณชอบได้เลย

          </p>


          <div className="mt-10 grid gap-6 md:grid-cols-2">

            <div className="rounded-3xl bg-[#20251f] p-7">

              <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
                Coffee Origin
              </p>

              <h3 className="mt-4 text-2xl font-semibold">
                {selectedBean.name}
              </h3>

              <div className="mt-6 space-y-5 text-sm leading-7 text-stone-300">

                <p>
                  <span className="text-stone-500">
                    แหล่งปลูก :
                  </span>{" "}
                  {selectedBean.origin}
                </p>

                <p>
                  <span className="text-stone-500">
                    ระดับความสูง :
                  </span>{" "}
                  {selectedBean.altitude}
                </p>

                <p>
                  <span className="text-stone-500">
                    Process :
                  </span>{" "}
                  {selectedBean.process}
                </p>

                <p>
                  <span className="text-stone-500">
                    สายพันธุ์ :
                  </span>{" "}
                  {selectedBean.varieties}
                </p>

              </div>

            </div>


            <div className="rounded-3xl bg-[#20251f] p-7">

              <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
                Tasting Profile
              </p>

              <h3 className="mt-4 text-2xl font-semibold">
                {selectedRoast.name}
              </h3>

              <p className="mt-2 text-sm uppercase tracking-[0.25em] text-emerald-400">
                {selectedRoast.english}
              </p>

              <div className="mt-8 rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-6">

                <p className="text-sm uppercase tracking-[0.25em] text-emerald-400">
                  Tasting Notes
                </p>

                <p className="mt-4 text-lg leading-8 text-stone-200">
                  {selectedRoast.tastingNotes}
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          5. COFFEE HOUSE
          ฉากหลังเป็นรูปร้านกาแฟ
          ห้ามลบ
      ===================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-20 sm:px-10">

        <div
          className="relative min-h-[420px] overflow-hidden rounded-[2rem] bg-cover bg-center"
          style={{
            backgroundImage:
              "url('/images/coffee/coffee-shop2.jpg')",
          }}
        >

          {/* overlay */}

          <div className="absolute inset-0 bg-black/65" />

          <div className="relative flex min-h-[420px] items-center p-10 sm:p-16">

            <div className="max-w-4xl">

              <p className="text-sm uppercase tracking-[0.3em] text-emerald-400">
                The Coffee House
              </p>

              <h2 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">
                แวะจิบกาแฟที่หลักลาย View
              </h2>

              <p className="mt-6 max-w-3xl text-lg leading-9 text-stone-200">

                ถ้ามาถึงหลักลาย View แล้ว
                อย่าเพียงแค่แวะพัก
                ลองใช้เวลาช้า ๆ กับกาแฟสักแก้ว
                ท่ามกลางภูเขาและธรรมชาติของน่าน

              </p>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          6. ORDER FORM
          จุดนี้รับค่าจากด้านบน
          ลูกค้าเลือก "จำนวนถุง" อย่างเดียว
      ===================================================== */}

      <CoffeeOrderForm
        variety={beanType}
        roastLevel={roast}
        sizeGrams={size}
        grindType={grind}
        unitPrice={price}
        beanName={selectedBean.name}
        beanThaiName={selectedBean.thaiName}
        roastName={selectedRoast.name}
        roastEnglish={selectedRoast.english}
        tastingNotes={selectedRoast.tastingNotes}
      />

    </main>
  );
}