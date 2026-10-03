import Image from "next/image";

const images = [
  {
    src: "/images/gallery/gallery1.jpg",
    alt: "มองออกไปไกลสุดสายตา แล้วปล่อยใจไว้กับขุนเขา",
  },
  {
    src: "/images/gallery/gallery2.jpg",
    alt: "แช่น้ำให้กายสบาย ปล่อยใจให้ภูเขาโอบกอด",
  },
  {
    src: "/images/gallery/gallery3.jpg",
    alt: "เก้าอี้ตัวเดิม กับเสียงของธรรมชาติ",
  },
  {
    src: "/images/gallery/gallery4.jpg",
    alt: "นั่งนิ่ง ๆ ฟังลมผ่าน แล้วปล่อยเวลาเดินช้า ๆ",
  },
  {
    src: "/images/gallery/gallery5.jpg",
    alt: "เช้าที่มีภูเขาอยู่ตรงหน้า และความสบายใจอยู่ข้างใน",
  },
  {
    src: "/images/gallery/gallery6.jpg",
    alt: "น้ำใส ภูเขาสวย กับวันที่ใจอยากพัก",
  },
  {
    src: "/images/gallery/gallery7.jpg",
    alt: "ห้องเล็ก ๆ ที่เต็มไปด้วยความอบอุ่นในทุกคืน",
  },
  {
    src: "/images/gallery/gallery8.jpg",
    alt: "มุมเล็ก ๆ แสงอุ่น ๆ และความสุขที่พอดี",
  },
  {
    src: "/images/gallery/gallery9.JPG",
    alt: "หมอกลอยเหนือเขา เหมือนธรรมชาติกำลังโอบกอดเรา",
  },
  {
    src: "/images/gallery/gallery10.jpg",
    alt: "นั่งมองเขา แล้วปล่อยใจให้เบาลง",
  },
  {
    src: "/images/gallery/gallery11.jpg",
    alt: "เมื่อฟ้ามืดลง ดาวก็เริ่มเล่าเรื่องของตัวเอง",
  },
  {
    src: "/images/gallery/gallery12.jpg",
    alt: "เช้าที่หมอกหนา กับกาแฟดริปร้อนแก้วโปรด",
  },
  {
    src: "/images/gallery/gallery13.jpg",
    alt: "แสงสุดท้ายของวัน กับความทรงจำที่ยังไม่อยากจบ",
  },
  {
    src: "/images/gallery/gallery14.jpg",
    alt: "เรียบง่ายจากธรรมชาติ และอบอุ่นจากความทรงจำ",
  },
  {
    src: "/images/gallery/gallery15.jpg",
    alt: "เดินช้า ๆ บนทางเล็ก ๆ แล้วพบความสุขระหว่างทาง",
  },
  {
    src: "/images/gallery/gallery16.jpg",
    alt: "ผลไม้จากผืนดิน รอยยิ้มจากวิถีบ้านป่า",
  },
  {
    src: "/images/gallery/gallery17.jpg",
    alt: "ทะเลหมอกลอยผ่านเขา เหมือนเช้าวันใหม่กำลังเริ่มต้น",
  },
  {
    src: "/images/gallery/gallery18.jpg",
    alt: "ระเบียงไม้ วิวไกล ๆ และช่วงเวลาที่ไม่ต้องรีบ",
  },
  {
    src: "/images/gallery/gallery19.jpg",
    alt: "ฝนพรำ หมอกลอย ป่าเขียว และใจที่ได้พัก",
  },
  {
    src: "/images/gallery/gallery20.jpg",
    alt: "สีเขียวของป่า กับความสุขที่เติบโตไปพร้อมธรรมชาติ",
  },
  {
    src: "/images/gallery/gallery21.jpg",
    alt: "จากมุมสูง เห็นผืนป่า เห็นทางกลับบ้าน และเห็นความสงบ",
  },
  {
    src: "/images/gallery/gallery22.jpg",
    alt: "แสงเย็นบนระเบียง กับวิวที่อยากนั่งมองนาน ๆ",
  },
  {
    src: "/images/gallery/gallery23.jpg",
    alt: "ปลายวันบนระเบียง กับคนข้าง ๆ ที่ทำให้วันธรรมดาพิเศษขึ้น",
  },
  {
    src: "/images/gallery/gallery24.jpg",
    alt: "แสงเช้าพร้อมทะเลหมอก กับอากาศที่หนาวเย็น",
  },
  {
    src: "/images/gallery/gallery25.jpg",
    alt: "หมอกคลุมภูเขา คลุมใจให้ช้าลงอีกนิด",
  },
  {
    src: "/images/gallery/gallery26.jpg",
    alt: "แสงเช้าทาบยอดเขา เติมวันใหม่ให้หัวใจ",
  },
  {
    src: "/images/gallery/gallery27.jpg",
    alt: "นั่งจิบกาแฟ มองภูเขา แล้วปล่อยเวลาไหลไป",
  },
  {
    src: "/images/gallery/gallery28.jpg",
    alt: "อาหารเช้า กับเรื่องราวดี ๆ ในวันใหม่",
  },
  {
    src: "/images/gallery/gallery29.jpg",
    alt: "อาหารเช้าแสนอร่อย จากคุณแม่ กับวิวภูเขาที่ทำให้ใจสบาย",
  },
  {
    src: "/images/gallery/gallery30.jpg",
    alt: "กาแฟหนึ่งแก้ว กับเรื่องราวดี ๆ จากเสียงกระซิบจากน่าน",
  },
  {
    src: "/images/gallery/gallery31.jpg",
    alt: "ดอกเก๊กฮวย ที่ปลูกเอง นำมาเป็นชาต้อนรับ",
  },
  {
    src: "/images/gallery/gallery32.jpg",
    alt: "หมอกหนาฟุ้ง กับความหนาวส่งท้ายปี",
  },
  {
    src: "/images/gallery/gallery33.jpg",
    alt: "บางช่วงเวลาสวยที่สุด เมื่อเราไม่ต้องพูดอะไร",
  },
  {
    src: "/images/gallery/gallery34.jpg",
    alt: "เริ่มต้นวันด้วยกาแฟดี ๆ ด้วยกาแฟแก้วหนึ่ง",
  },
  {
    src: "/images/gallery/gallery35.jpg",
    alt: "แวะพักสักแก้ว แล้วให้ธรรมชาติเล่าเรื่องของมัน",
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
              className="group relative aspect-[4/3] overflow-hidden rounded-2xl bg-black shadow-lg sm:rounded-3xl"
            >
              <Image
  src={image.src}
  alt={image.alt}
  fill
  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 33vw"
  className="object-contain transition duration-500 group-hover:scale-105"
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