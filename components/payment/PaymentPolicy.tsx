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
        <p>• ยอดค่าที่พักรวมกิจกรรมวิถีบ้านป่าตั้งแต่ 4,000 บาทขึ้นไป ชำระมัดจำ 50% โดยไม่รวมค่าอาหาร</p>
        <p>• หากยอดค่าที่พักรวมกิจกรรมต่ำกว่า 4,000 บาท ต้องชำระเต็มจำนวน</p>
        <p>• ค่าอาหารที่สั่งล่วงหน้าชำระที่เคาน์เตอร์ในวันเช็กอิน และไม่รวมในยอดมัดจำ</p>
        <p>• หากชำระมัดจำ 50% แล้วผู้เข้าพักยกเลิก ขอสงวนสิทธิ์ไม่คืนเงินมัดจำ</p>
        <p>• กรณีชำระเต็มจำนวนและมีเหตุสุดวิสัยจนเข้าพักไม่ได้ ต้องแจ้งล่วงหน้าไม่น้อยกว่า 7 วันก่อนเช็กอิน จึงเข้าเงื่อนไขพิจารณาคืนเงิน</p>
        <p>• การแจ้งน้อยกว่า 7 วันก่อนเช็กอิน ไม่เข้าเงื่อนไขคืนเงินตามนโยบายนี้</p>
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