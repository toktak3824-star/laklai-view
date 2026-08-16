"use client";

import { useState } from "react";
import { uploadSlip } from "@/lib/uploadSlip";

type Props = {
  bookingCode: string;
};

export default function PaymentSlip({
  bookingCode,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    if (!file) {
      setMessage("กรุณาเลือกสลิปการโอนเงินก่อน");
      return;
    }

    try {
      setLoading(true);
      setMessage("");

      console.log("กำลังอัปโหลดสลิป...");

      const slipUrl = await uploadSlip(file);

      console.log("Slip URL =", slipUrl);

      const response = await fetch("/api/payment/submit-slip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bookingCode,
          slipUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "ไม่สามารถส่งสลิปได้"
        );
      }

      setMessage(
        "ส่งสลิปเรียบร้อยแล้ว กรุณารอแอดมินตรวจสอบ"
      );

      setFile(null);

    } catch (error) {
      console.error("SUBMIT SLIP ERROR =", error);

      setMessage(
        "ไม่สามารถส่งสลิปได้ กรุณาลองใหม่อีกครั้ง"
      );

    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 rounded-3xl bg-white p-8 shadow">

      <h2 className="text-2xl font-bold text-stone-800">
        ส่งหลักฐานการโอนเงิน
      </h2>

      <p className="mt-2 text-sm text-stone-500">
        กรุณาเลือกภาพสลิปการโอนเงินของคุณ
      </p>

      <div className="mt-6">

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setFile(
              e.target.files?.[0] ?? null
            );

            setMessage("");
          }}
          className="block w-full rounded-xl border border-stone-300 bg-white p-3 text-sm text-stone-700"
        />

      </div>

      {file && (
        <p className="mt-3 text-sm text-stone-600">
          ไฟล์ที่เลือก: {file.name}
        </p>
      )}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="mt-6 w-full rounded-xl bg-green-700 py-4 text-lg font-semibold text-white transition hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "กำลังส่งสลิป..."
          : "ส่งหลักฐานการโอน"}
      </button>

      {message && (
        <div className="mt-4 rounded-xl bg-stone-100 p-4 text-center text-sm text-stone-700">
          {message}
        </div>
      )}

    </div>
  );
}