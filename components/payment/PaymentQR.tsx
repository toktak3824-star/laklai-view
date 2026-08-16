import Image from "next/image";

export default function PaymentQR() {
  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">

      {/* PromptPay */}

      <div className="rounded-3xl bg-white p-8 shadow">

        <h2 className="mb-5 text-2xl font-bold text-stone-800">
          PromptPay ร้านค้า (ttb)
        </h2>

        <Image
          src="/payment/promptpay-ttb.jpg"
          alt="PromptPay"
          width={350}
          height={350}
          className="mx-auto rounded-2xl border"
        />

        <p className="mt-6 text-center text-sm text-stone-500">
          สแกนผ่าน Mobile Banking
          ของทุกธนาคารได้ทันที
        </p>

      </div>

      {/* TrueMoney */}

      <div className="rounded-3xl bg-white p-8 shadow">

        <h2 className="mb-5 text-2xl font-bold text-stone-800">
          TrueMoney Wallet
        </h2>

        <Image
          src="/payment/truemoney.jpg"
          alt="TrueMoney"
          width={350}
          height={350}
          className="mx-auto rounded-2xl border"
        />

        <p className="mt-6 text-center text-sm text-stone-500">
          รองรับการชำระผ่าน
          TrueMoney Wallet
        </p>

      </div>

    </div>
  );
}