"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

type RoomCardProps = {
  id: string;
  title: string;
  subtitle: string;
  images: string[];
  description: string;
  price: number;
  originalPrice: number;
  holidayPrice: number;
  originalHolidayPrice: number;
  defaultGuests: number;
  maxGuests: number;
  extraAdultPrice: number;
  extraChildBedPrice: number;
  extraBed: string;
  freeChildAge: number;
};

export default function RoomCard({
  id,
  title,
  subtitle,
  images,
  description,
  price,
  originalPrice,
  holidayPrice,
  originalHolidayPrice,
  defaultGuests,
  maxGuests,
  extraAdultPrice,
  extraChildBedPrice,
  extraBed,
  freeChildAge,
}: RoomCardProps) {

  // IMAGE SLIDER
  const [currentImage, setCurrentImage] = useState(0);

  const totalImages = images.length;

  const currentImageSrc =
    totalImages > 0 ? images[currentImage] : "";

  const nextImage = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (totalImages <= 1) return;

    setCurrentImage((previous) =>
      previous === totalImages - 1 ? 0 : previous + 1
    );
  };

  const previousImage = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (totalImages <= 1) return;

    setCurrentImage((previous) =>
      previous === 0 ? totalImages - 1 : previous - 1
    );
  };

  // MOBILE SWIPE
  const [touchStartX, setTouchStartX] =
    useState<number | null>(null);

  const [touchEndX, setTouchEndX] =
    useState<number | null>(null);

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    setTouchStartX(event.touches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    setTouchEndX(event.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) {
      return;
    }

    const distance = touchStartX - touchEndX;

    if (Math.abs(distance) < 50) {
      setTouchStartX(null);
      setTouchEndX(null);
      return;
    }

    if (distance > 0) {
      setCurrentImage((previous) =>
        previous === totalImages - 1 ? 0 : previous + 1
      );
    } else {
      setCurrentImage((previous) =>
        previous === 0 ? totalImages - 1 : previous - 1
      );
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-stone-800 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">

      {/* IMAGE SLIDER */}
      <div
        className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {currentImageSrc ? (
          <Image
            src={currentImageSrc}
            alt={`${title} - Laklai View ที่พักบนเส้นทางปัว–บ่อเกลือ จังหวัดน่าน`}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain transition duration-500"
            priority={currentImage === 0}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-700 text-sm text-stone-300">
            ไม่มีรูปภาพ
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {totalImages > 1 && (
          <button
            type="button"
            onClick={previousImage}
            aria-label="ดูรูปก่อนหน้า"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl text-white backdrop-blur-md"
          >
            ‹
          </button>
        )}

        {totalImages > 1 && (
          <button
            type="button"
            onClick={nextImage}
            aria-label="ดูรูปถัดไป"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl text-white backdrop-blur-md"
          >
            ›
          </button>
        )}

        {totalImages > 1 && (
          <div className="absolute right-4 top-4 z-20 rounded-full bg-black/50 px-3 py-1.5 text-xs text-white backdrop-blur-md">
            {currentImage + 1} / {totalImages}
          </div>
        )}

        <Link
          href={`/rooms/${id}`}
          className="absolute bottom-4 left-4 z-20 rounded-full bg-black/45 px-3 py-1.5 text-xs text-white backdrop-blur-md"
        >
          ดูบ้านพัก
        </Link>
      </div>

      {/* ROOM INFORMATION */}
      <div className="p-5 sm:p-7">

        <h3 className="text-2xl font-bold text-amber-50 sm:text-3xl">
          {title}
        </h3>

        <p className="mt-1 text-sm italic text-amber-100/70 sm:text-base">
          {subtitle}
        </p>

        <p className="mt-4 text-sm leading-7 text-stone-200 sm:text-base sm:leading-8">
          {description}
        </p>

        {/* PRICE */}
        <div className="mt-5 grid grid-cols-2 gap-3">

          <div className="rounded-2xl bg-stone-900/60 p-4">
            <p className="text-xs text-stone-400 sm:text-sm">
              ราคาวันธรรมดา
            </p>

            <p className="mt-1 text-2xl font-bold text-green-400 sm:text-3xl">
              ฿{price.toLocaleString("th-TH")}
            </p>

            {originalPrice > price && (
              <p className="mt-1 text-xs text-stone-500 line-through">
                ฿{originalPrice.toLocaleString("th-TH")}
              </p>
            )}
          </div>

          <div className="rounded-2xl bg-stone-900/60 p-4">
            <p className="text-xs text-stone-400 sm:text-sm">
              ราคาวันหยุด / นักขัตฤกษ์
            </p>

            <p className="mt-1 text-2xl font-bold text-amber-300 sm:text-3xl">
              ฿{holidayPrice.toLocaleString("th-TH")}
            </p>

            {originalHolidayPrice > holidayPrice && (
              <p className="mt-1 text-xs text-stone-500 line-through">
                ฿{originalHolidayPrice.toLocaleString("th-TH")}
              </p>
            )}
          </div>

        </div>

        {/* GUEST CAPACITY */}
        <div className="mt-3 grid grid-cols-2 gap-3">

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-stone-400 sm:text-sm">
              ผู้เข้าพักปกติ
            </p>

            <p className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {defaultGuests} คน
            </p>
          </div>

          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-stone-400 sm:text-sm">
              เข้าพักได้สูงสุด
            </p>

            <p className="mt-1 text-xl font-bold text-white sm:text-2xl">
              {maxGuests} คน
            </p>
          </div>

        </div>

        {/* EXTRA GUEST DETAILS */}
        <div className="mt-3 rounded-2xl border border-white/10 bg-stone-900/40 p-4">

          <p className="mb-3 text-sm font-bold text-amber-100">
            รายละเอียดผู้เข้าพักเพิ่มเติม
          </p>

          <div className="space-y-2 text-xs leading-6 text-stone-300 sm:text-sm">

            <p>
              ✓ ผู้ใหญ่เพิ่มเติม {extraAdultPrice.toLocaleString("th-TH")} บาท/คน
            </p>

            <p>
              ✓ เตียงเสริม {extraBed}
            </p>

            <p>
              ✓ ค่าเตียงเสริมเด็ก {extraChildBedPrice.toLocaleString("th-TH")} บาท
            </p>

            <p>
              ✓ เด็กอายุไม่เกิน {freeChildAge} ปี พักฟรีตามเงื่อนไขของที่พัก
            </p>

          </div>

          <p className="mt-3 border-t border-white/10 pt-3 text-[11px] leading-5 text-stone-400">
            * ราคาที่แสดงเป็นราคาสำหรับผู้เข้าพักปกติ
            ราคาจริงขึ้นอยู่กับวันที่เลือกเข้าพักและจำนวนผู้เข้าพักเพิ่มเติม
          </p>

        </div>

        {/* BOOKING POLICY */}
        <div className="mt-4 space-y-1 text-xs leading-6 text-stone-400 sm:text-sm">

          <p>
            ✓ เลื่อนวันเข้าพักได้ฟรี 1 ครั้ง ภายในปีที่จอง
            ไม่สามารถจองวันหยุดสิ้นปี-ปีใหม่ได้
            (ตามเงื่อนไขของที่พัก)
          </p>

          <p>
            ✓ หากยกเลิกการจองก่อนวันเข้าพัก 7 วันขึ้นไป
            ทางที่พักคืนเงิน 50% ของยอดที่ชำระ
          </p>

          <p>
            ✓ สอบถามรายละเอียดเพิ่มเติมผ่าน Facebook Page
          </p>

        </div>

        {/* ACTION BUTTONS */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

          <Link
            href={`/rooms/${id}`}
            className="flex min-h-12 w-full items-center justify-center rounded-full border border-stone-600 bg-stone-900 px-5 py-3.5 text-sm font-semibold text-stone-100 transition hover:bg-stone-800 sm:min-h-14 sm:text-base"
          >
            ดูรายละเอียด
          </Link>

          <Link
            href={`/rooms/${id}#booking`}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#3D7A4E] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#2B5B39] sm:min-h-14 sm:text-base"
          >
            📅 เช็กวันว่าง
          </Link>

        </div>

      </div>
    </article>
  );
}