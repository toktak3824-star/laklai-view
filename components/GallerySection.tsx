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
    <section className="py-24 bg-gradient-to-b from-[#214D34] to-[#18392B]">
      <div className="max-w-7xl mx-auto px-6">

        <h2 className="text-5xl font-bold text-center text-stone-50 mb-4">
          สัมผัสบรรยากาศ Laklai View
        </h2>

        <p className="text-center text-stone-200 text-xl mb-14">
          ทุกช่วงเวลาที่นี่ คือความทรงจำที่เรียบง่าย อบอุ่น และโอบล้อมด้วยธรรมชาติ
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {images.map((image) => (
            <div
  key={image.src}
  className="group relative overflow-hidden rounded-3xl shadow-xl"
>
  <Image
    src={image.src}
    alt={image.alt}
    width={800}
    height={600}
    className="w-full h-72 object-cover transition duration-500 group-hover:scale-110"
  />

  {/* คำอธิบายรูป */}
  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-5 pb-5 pt-12">
    <p className="text-base font-medium text-white drop-shadow-md">
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