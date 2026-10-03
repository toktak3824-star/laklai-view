"use client";

import Image from "next/image";
import { useState } from "react";

type RoomDetailGalleryProps = {
  images: string[];
  title: string;
};

export default function RoomDetailGallery({
  images,
  title,
}: RoomDetailGalleryProps) {
  /*
   * =====================================================
   * CURRENT IMAGE
   *
   * เก็บหมายเลขรูปที่กำลังแสดง
   *
   * รูปแรก = 0
   * รูปที่สอง = 1
   * รูปที่สาม = 2
   * =====================================================
   */

  const [currentImage, setCurrentImage] = useState(0);

  /*
   * =====================================================
   * IMAGE COUNT
   * =====================================================
   */

  const totalImages = images.length;

  /*
   * =====================================================
   * TOUCH / SWIPE
   *
   * สำหรับมือถือ
   *
   * ปัดซ้าย = รูปถัดไป
   * ปัดขวา = รูปก่อนหน้า
   * =====================================================
   */

  const [touchStartX, setTouchStartX] = useState<number | null>(
    null
  );

  const [touchEndX, setTouchEndX] = useState<number | null>(
    null
  );

  /*
   * =====================================================
   * NEXT IMAGE
   * =====================================================
   */

  const nextImage = () => {
    if (totalImages <= 1) return;

    setCurrentImage((previous) =>
      previous === totalImages - 1 ? 0 : previous + 1
    );
  };

  /*
   * =====================================================
   * PREVIOUS IMAGE
   * =====================================================
   */

  const previousImage = () => {
    if (totalImages <= 1) return;

    setCurrentImage((previous) =>
      previous === 0 ? totalImages - 1 : previous - 1
    );
  };

  /*
   * =====================================================
   * TOUCH START
   * =====================================================
   */

  const handleTouchStart = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    setTouchStartX(event.touches[0].clientX);
    setTouchEndX(null);
  };

  /*
   * =====================================================
   * TOUCH MOVE
   * =====================================================
   */

  const handleTouchMove = (
    event: React.TouchEvent<HTMLDivElement>
  ) => {
    setTouchEndX(event.touches[0].clientX);
  };

  /*
   * =====================================================
   * TOUCH END
   * =====================================================
   */

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
      nextImage();
    }

    /*
     * ปัดขวา
     * → รูปก่อนหน้า
     */

    else {
      previousImage();
    }

    setTouchStartX(null);
    setTouchEndX(null);
  };

  /*
   * =====================================================
   * EMPTY STATE
   *
   * ป้องกันกรณีไม่มีรูปภาพ
   * =====================================================
   */

  if (totalImages === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-3xl bg-stone-800 text-stone-400">
        ไม่มีรูปภาพ
      </div>
    );
  }

  /*
   * =====================================================
   * CURRENT IMAGE
   * =====================================================
   */

  const currentImageSrc = images[currentImage];

  return (
    <div
      className="relative overflow-hidden rounded-3xl"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* ==================================================
          MAIN IMAGE
      ================================================== */}

      <div className="relative aspect-[4/3] w-full bg-stone-900 sm:aspect-[16/10]">
        <Image
          src={currentImageSrc}
          alt={`${title} - Laklai View ที่พักบนเส้นทางปัว–บ่อเกลือ จังหวัดน่าน`}
          fill
          priority={currentImage === 0}
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover"
        />

        {/* ==================================================
            DARK GRADIENT
        ================================================== */}

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

        {/* ==================================================
            PREVIOUS BUTTON
        ================================================== */}

        {totalImages > 1 && (
          <button
            type="button"
            onClick={previousImage}
            aria-label="ดูรูปก่อนหน้า"
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-3xl font-light leading-none text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95 sm:left-5 sm:h-12 sm:w-12"
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
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-3xl font-light leading-none text-white backdrop-blur-md transition hover:bg-black/65 active:scale-95 sm:right-5 sm:h-12 sm:w-12"
          >
            ›
          </button>
        )}

        {/* ==================================================
            IMAGE COUNTER
        ================================================== */}

        {totalImages > 1 && (
          <div className="absolute right-4 top-4 z-20 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md sm:right-5 sm:top-5 sm:text-sm">
            {currentImage + 1} / {totalImages}
          </div>
        )}

        {/* ==================================================
            SWIPE HINT
        ================================================== */}

        {totalImages > 1 && currentImage === 0 && (
          <div className="pointer-events-none absolute bottom-4 left-1/2 z-20 -translate-x-1/2 rounded-full bg-black/45 px-4 py-2 text-xs text-white backdrop-blur-md sm:text-sm">
            ← ปัดเพื่อดูรูปเพิ่มเติม →
          </div>
        )}
      </div>
    </div>
  );
}