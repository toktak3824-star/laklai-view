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
};

export default function RoomCard({
  id,
  title,
  subtitle,
  images,
  description,
  price,
  originalPrice,
}: RoomCardProps) {
  /*
   * =====================================================
   * IMAGE SLIDER
   *
   * รูปทั้งหมดของบ้านจะถูกส่งเข้ามาจาก room.images
   *
   * ลูกค้าสามารถ:
   * - กดปุ่มซ้ายเพื่อย้อนกลับ
   * - กดปุ่มขวาเพื่อดูรูปถัดไป
   * - ปัดซ้าย/ขวาบนมือถือ
   * =====================================================
   */

  const [currentImage, setCurrentImage] = useState(0);

  /*
   * =====================================================
   * ตรวจสอบจำนวนรูป
   * =====================================================
   */

  const totalImages = images.length;

  /*
   * =====================================================
   * รูปปัจจุบัน
   * =====================================================
   */

  const currentImageSrc =
    totalImages > 0 ? images[currentImage] : "";

  /*
   * =====================================================
   * เปลี่ยนเป็นรูปถัดไป
   * =====================================================
   */

  const nextImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (totalImages <= 1) return;

    setCurrentImage((previous) =>
      previous === totalImages - 1 ? 0 : previous + 1
    );
  };

  /*
   * =====================================================
   * เปลี่ยนเป็นรูปก่อนหน้า
   * =====================================================
   */

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

  /*
   * =====================================================
   * TOUCH / SWIPE
   *
   * สำหรับมือถือ
   *
   * ปัดซ้าย  = รูปถัดไป
   * ปัดขวา   = รูปก่อนหน้า
   * =====================================================
   */

  const [touchStartX, setTouchStartX] = useState<number | null>(
    null
  );

  const [touchEndX, setTouchEndX] = useState<number | null>(
    null
  );

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

    /*
     * ต้องปัดอย่างน้อย 50px
     * ถึงจะถือว่าเป็นการเปลี่ยนรูป
     */

    const minimumSwipeDistance = 50;

    if (Math.abs(distance) < minimumSwipeDistance) {
      setTouchStartX(null);
      setTouchEndX(null);
      return;
    }

    /*
     * ปัดซ้าย
     * → รูปถัดไป
     */

    if (distance > 0) {
      setCurrentImage((previous) =>
        previous === totalImages - 1 ? 0 : previous + 1
      );
    } else {
      /*
       * ปัดขวา
       * → รูปก่อนหน้า
       */

      setCurrentImage((previous) =>
        previous === 0 ? totalImages - 1 : previous - 1
      );
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  return (
    <article className="group overflow-hidden rounded-3xl border border-white/10 bg-stone-800 shadow-lg transition duration-300 hover:-translate-y-1 hover:shadow-2xl">

      {/* ==================================================
          IMAGE SLIDER
      ================================================== */}

      <div
        className="relative aspect-[4/3] w-full overflow-hidden sm:aspect-[16/10]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* ==================================================
            IMAGE
        ================================================== */}

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

        {/* ==================================================
            DARK GRADIENT
        ================================================== */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* ==================================================
            PREVIOUS BUTTON
        ================================================== */}

        {totalImages > 1 && (
          <button
            type="button"
            onClick={previousImage}
            aria-label="ดูรูปก่อนหน้า"
            className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl font-light text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95 sm:left-4 sm:h-11 sm:w-11"
          >
            ‹
          </button>
        )}

        {/* ==================================================
            NEXT BUTTON
        ================================================== */}

        {totalImages > 1 && (
          <button
            type="button"
            onClick={nextImage}
            aria-label="ดูรูปถัดไป"
            className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-2xl font-light text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95 sm:right-4 sm:h-11 sm:w-11"
          >
            ›
          </button>
        )}

        {/* ==================================================
            IMAGE COUNTER
        ================================================== */}

        {totalImages > 1 && (
          <div className="absolute right-4 top-4 z-20 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
            {currentImage + 1} / {totalImages}
          </div>
        )}

        {/* ==================================================
            VIEW ROOM BUTTON
        ================================================== */}

        <Link
          href={`/rooms/${id}`}
          className="absolute bottom-4 left-4 z-20 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md transition hover:bg-black/65"
        >
          ดูบ้านพัก
        </Link>
      </div>

      {/* ==================================================
          CONTENT
      ================================================== */}

      <div className="p-5 sm:p-7">

        {/* ==================================================
            ROOM NAME
        ================================================== */}

        <h3 className="text-2xl font-bold leading-tight text-amber-50 sm:text-3xl">
          {title}
        </h3>

        <p className="mt-1 text-sm italic text-amber-100/70 sm:text-base">
          {subtitle}
        </p>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <p className="mt-4 text-sm leading-7 text-stone-200 sm:text-base sm:leading-8">
          {description}
        </p>

        {/* ==================================================
            PRICE
        ================================================== */}

        <div className="mt-5 rounded-2xl border border-white/10 bg-stone-900/40 p-4 sm:p-5">

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-400 sm:text-xs">
            🌿 ราคาพิเศษเมื่อจองผ่านเว็บไซต์หลัก
          </p>

          <div className="mt-2 flex items-end gap-3">
            <span className="text-base text-stone-500 line-through sm:text-lg">
              ฿{originalPrice.toLocaleString()}
            </span>

            <span className="text-3xl font-bold leading-none text-green-400 sm:text-4xl">
              ฿{price.toLocaleString()}
            </span>
          </div>

          {originalPrice > price && (
            <p className="mt-2 text-xs font-semibold text-green-300 sm:text-sm">
              ประหยัด {(originalPrice - price).toLocaleString()} บาท
            </p>
          )}
        </div>

        {/* ==================================================
            BOOKING POLICY
        ================================================== */}

        <div className="mt-4 space-y-1 text-xs leading-6 text-stone-400 sm:text-sm">
          <p>
            ✓ เลื่อนวันเข้าพักได้ฟรี 1 ครั้ง
            (ตามเงื่อนไขของที่พัก)
          </p>

          <p>
            ✓ หากยกเลิกการจอง
            ทางที่พักคืนเงิน 50% ของยอดที่ชำระ
          </p>

          <p>
            ✓ สอบถามรายละเอียดเพิ่มเติมผ่าน
            Facebook Page ของที่พัก
          </p>
        </div>

        {/* ==================================================
            ACTION BUTTONS
        ================================================== */}

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">

          {/* DETAIL */}

          <Link
            href={`/rooms/${id}`}
            className="flex min-h-12 w-full items-center justify-center rounded-full border border-stone-600 bg-stone-900 px-5 py-3.5 text-sm font-semibold text-stone-100 transition hover:border-stone-400 hover:bg-stone-800 active:scale-[0.98] sm:min-h-14 sm:text-base"
          >
            ดูรายละเอียด
          </Link>

          {/* AVAILABILITY */}

          <Link
            href={`/rooms/${id}#booking`}
            className="flex min-h-12 w-full items-center justify-center rounded-full bg-[#3D7A4E] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#2B5B39] active:scale-[0.98] sm:min-h-14 sm:text-base"
          >
            📅 เช็กวันว่าง
          </Link>
        </div>
      </div>
    </article>
  );
}