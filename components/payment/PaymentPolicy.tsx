"use client";

import { useState } from "react";

type Props = {
  onAcceptChange?: (accepted: boolean) => void;
};

export default function PaymentPolicy({
  onAcceptChange,
}: Props) {

  const [accepted, setAccepted] = useState(false);

  function handleChange(value: boolean) {
    setAccepted(value);
    onAcceptChange?.(value);
  }

  return (
    <div className="mt-8 rounded-3xl bg-white p-8 shadow">

      <h2 className="mb-6 text-2xl font-bold text-stone-800">
        นโยบายการจอง
      </h2>

      <div className="space-y-4 text-stone-700 leading-8">

        <p>
          • การจองจะสมบูรณ์เมื่อชำระเงินเต็มจำนวน
        </p>

        <p>
          • หากผู้เข้าพักยกเลิกการจอง หรือไม่เข้าพักตามกำหนด
          ขอสงวนสิทธิ์ไม่คืนเงินทุกกรณี
        </p>

        <p>
          • ไม่สามารถเลื่อนวันเข้าพักได้
          เว้นแต่เกิดจากเหตุที่ Laklai View
          ไม่สามารถให้บริการได้เอง
        </p>

        <p>
          • เมื่อทำการชำระเงินแล้ว
          ถือว่าผู้เข้าพักยอมรับเงื่อนไขทั้งหมด
        </p>

      </div>

      <div className="mt-8 rounded-2xl border border-green-200 bg-green-50 p-5">

        <label className="flex items-start gap-4">

          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => handleChange(e.target.checked)}
            className="mt-1 h-5 w-5"
          />

          <span className="text-stone-800">

            ข้าพเจ้าได้อ่าน
            เข้าใจ
            และยอมรับนโยบายการจอง
            การชำระเงิน
            และการยกเลิกของ Laklai View แล้ว

          </span>

        </label>

      </div>

    </div>
  );
}