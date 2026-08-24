import GallerySection from "@/components/GallerySection";
import Hero from "@/components/Hero";
import Rooms from "@/components/Rooms";

const lodgingSchema = {
  "@context": "https://schema.org",
  "@type": "LodgingBusiness",
  name: "Laklai View",
  alternateName: "หลักลาย View",
  description:
    "ที่พักท่ามกลางธรรมชาติในอำเภอปัว จังหวัดน่าน บ้านพักส่วนตัว วิวภูเขา " +
    "บรรยากาศเงียบสงบ พร้อมพื้นที่พักผ่อนและสระน้ำแร่จากธรรมชาติ " +
    "ที่พักบ่อเกลือ ที่พักใกล้ถนนเลข 3",
  url: "https://laklaiview.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "ปัว" + "บ่อเกลือ",
    addressRegion: "น่าน",
    addressCountry: "TH",
  },
  areaServed: {
    "@type": "Place",
    name: "ปัว จังหวัดน่าน"+
    "บ่อเกลือ จังหวัดน่าน",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(lodgingSchema),
        }}
      />

      <main>
        <Hero />
        <GallerySection />
        <Rooms />
      </main>
    </>
  );
}