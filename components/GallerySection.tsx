import Image from "next/image";

const images = [
  {
    src: "/images/gallery/gallery1.jpg",
    alt: "บรรยากาศภายในที่พัก Laklai View พร้อมวิวภูเขาและธรรมชาติ",
  },
  {
    src: "/images/gallery/gallery2.jpg",
    alt: "สระน้ำส่วนตัวพร้อมวิวภูเขาสีเขียวของ Laklai View",
  },
  {
    src: "/images/gallery/gallery3.jpg",
    alt: "มุมนั่งพักผ่อนพร้อมวิวภูเขาและธรรมชาติ",
  },
  {
    src: "/images/gallery/gallery4.jpg",
    alt: "มุมพักผ่อนท่ามกลางธรรมชาติและวิวภูเขา",
  },
  {
    src: "/images/gallery/gallery5.jpg",
    alt: "บรรยากาศการพักผ่อนพร้อมวิวภูเขาและทะเลหมอก",
  },
  {
    src: "/images/gallery/gallery6.jpg",
    alt: "วิวภูเขาและธรรมชาติจากบริเวณที่พัก Laklai View",
  },
  {
    src: "/images/gallery/gallery7.jpg",
    alt: "ห้องพักบรรยากาศอบอุ่นของ Laklai View",
  },
  {
    src: "/images/gallery/gallery8.jpg",
    alt: "มุมพักผ่อนภายในที่พักพร้อมบรรยากาศเป็นส่วนตัว",
  },
  {
    src: "/images/gallery/gallery9.JPG",
    alt: "ทะเลหมอกยามเช้าท่ามกลางภูเขาของจังหวัดน่าน",
  },
  {
    src: "/images/gallery/gallery10.jpg",
    alt: "มุมนั่งพักผ่อนท่ามกลางวิวภูเขาและธรรมชาติ",
  },
  {
    src: "/images/gallery/gallery11.jpg",
    alt: "บรรยากาศท้องฟ้ายามค่ำคืนเหนือภูเขา",
  },
  {
    src: "/images/gallery/gallery12.jpg",
    alt: "บรรยากาศยามเช้าพร้อมทะเลหมอกจากที่พัก",
  },
  {
    src: "/images/gallery/gallery13.jpg",
    alt: "วิวภูเขาและธรรมชาติจาก Laklai View",
  },
  {
    src: "/images/gallery/gallery14.jpg",
    alt: "แสงอาทิตย์ยามเช้าท่ามกลางทะเลหมอก",
  },
  {
    src: "/images/gallery/gallery15.jpg",
    alt: "ทางเดินท่ามกลางต้นไม้และธรรมชาติ",
  },
  {
    src: "/images/gallery/gallery16.jpg",
    alt: "ผลผลิตจากธรรมชาติและบรรยากาศวิถีชีวิตท้องถิ่น",
  },
  {
    src: "/images/gallery/gallery17.jpg",
    alt: "วิถีชีวิตท้องถิ่นเก็บเงาะช่วงปลายสิงหาคม-ปลายกันยายนทุกปี",
  },
  {
    src: "/images/gallery/gallery18.jpg",
    alt: "ระเบียงไม้สำหรับนั่งพักผ่อนพร้อมวิวภูเขา",
  },
  {
    src: "/images/gallery/gallery19.jpg",
    alt: "วิถีชีวิตท้องถิ่นในช่วงฤดูฝนรอบที่พัก Laklai View",
  },
  {
    src: "/images/gallery/gallery20.jpg",
    alt: "ผลผลิตจากธรรมชาติในพื้นที่ที่พัก Laklai View",
  },
  {
    src: "/images/gallery/gallery21.jpg",
    alt: "บรรยากาศธรรมชาติและผืนป่ารอบ Laklai View",
  },
];

export default function GallerySection() {
  return (
    <section className="bg-gradient-to-b from-[#214D34] to-[#18392B] py-14 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mx-auto mb-9 max-w-3xl text-center sm:mb-14">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-green-200 sm:text-sm">
            EXPERIENCE LAKLAI VIEW
          </p>

          <h2 className="text-3xl font-bold leading-tight text-stone-50 sm:text-4xl lg:text-5xl">
            สัมผัสบรรยากาศ Laklai View
          </h2>

          <p className="mt-4 text-sm leading-7 text-stone-200 sm:text-lg sm:leading-8">
            ทุกช่วงเวลาที่นี่ คือความทรงจำที่เรียบง่าย
            อบอุ่น และโอบล้อมด้วยธรรมชาติ
          </p>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:gap-6">
          {images.map((image) => (
            <div
              key={image.src}
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-stone-900 shadow-lg sm:rounded-3xl"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />

              {/* Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-90" />

              {/* Caption */}
              <div className="absolute inset-x-0 bottom-0 p-3 sm:p-4 md:p-5">
                <p className="line-clamp-3 text-[11px] font-medium leading-5 text-white drop-shadow-md sm:text-sm sm:leading-6">
                  {image.alt}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}