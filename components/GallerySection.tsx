import Image from "next/image";

const images = [
  "/images/gallery/gallery1.jpg",
  "/images/gallery/gallery2.jpg",
  "/images/gallery/gallery3.jpg",
  "/images/gallery/gallery4.jpg",
  "/images/gallery/gallery5.jpg",
  "/images/gallery/gallery6.jpg",
  "/images/gallery/gallery7.jpg",
  "/images/gallery/gallery8.jpg",
  "/images/gallery/gallery9.jpg",
  "/images/gallery/gallery10.jpg",
  "/images/gallery/gallery11.jpg",
  "/images/gallery/gallery12.jpg",
    
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
              key={image}
              className="overflow-hidden rounded-3xl shadow-xl"
            >
              <Image
                src={image}
                alt="Laklai View"
                width={800}
                height={600}
                className="w-full h-72 object-cover hover:scale-110 transition duration-500"
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}