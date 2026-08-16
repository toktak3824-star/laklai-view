import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative h-screen">
      <Image
        src="/images/hero/hero.jpg"
        alt="Laklai View"
        fill
        className="object-cover"
        priority
      />

      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-6xl font-bold">
            หลักลาย View
          </h1>

          <p className="mt-6 text-2xl">
            หลีกหนีความวุ่นวาย
          </p>

          <p className="text-lg">
            กลับมาใช้เวลากับธรรมชาติอีกครั้ง
          </p>

          <button className="mt-8 rounded-full bg-green-600 px-8 py-4 text-lg hover:bg-green-700">
            จองที่พัก
          </button>
        </div>
      </div>
    </section>
  );
}