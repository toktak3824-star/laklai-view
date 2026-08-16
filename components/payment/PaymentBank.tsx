"use client";

export default function PaymentBank() {
  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    alert("คัดลอกเลขบัญชีแล้ว");
  }

  return (
    <div className="mt-8 rounded-3xl bg-white p-8 shadow">

      <h2 className="mb-8 text-2xl font-bold text-stone-800">
        หรือโอนผ่านบัญชีธนาคาร
      </h2>

      {/* SCB */}

      <div className="mb-6 rounded-2xl border border-stone-200 p-6">

        <h3 className="text-xl font-bold text-stone-800">
          ธนาคารไทยพาณิชย์
        </h3>

        <p className="mt-3 text-3xl font-bold text-green-700">
          921-224-1462
        </p>

        <p className="mt-2 text-stone-600">
          สุวิมล ใหม่วงค์
        </p>

        <button
          onClick={() => copy("9212241462")}
          className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-white hover:bg-green-800"
        >
          คัดลอกเลขบัญชี
        </button>

      </div>

      {/* Krungthai */}

      <div className="rounded-2xl border border-stone-200 p-6">

        <h3 className="text-xl font-bold text-stone-800">
          ธนาคารกรุงไทย
        </h3>

        <p className="mt-3 text-3xl font-bold text-green-700">
          661-106-6365
        </p>

        <p className="mt-2 text-stone-600">
          สุวิมล ใหม่วงค์
        </p>

        <button
          onClick={() => copy("6611066365")}
          className="mt-5 rounded-xl bg-green-700 px-5 py-3 text-white hover:bg-green-800"
        >
          คัดลอกเลขบัญชี
        </button>

      </div>

    </div>
  );
}