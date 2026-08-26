"use client";

import { useState } from "react";

type Props = {
  bookingCode: string;
};

export default function PaymentSlip({
  bookingCode,
}: Props) {
  const [file, setFile] =
    useState<File | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!file) {
      setError(
        "กรุณาเลือกไฟล์สลิปก่อนส่ง"
      );
      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "bookingCode",
        bookingCode
      );

      formData.append(
        "slip",
        file
      );

      const response =
        await fetch(
          "/api/payment/submit-slip",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.error ||
            "ไม่สามารถส่งสลิปได้"
        );
      }

      setMessage(
        "ส่งสลิปเรียบร้อยแล้ว กรุณารอเจ้าหน้าที่ตรวจสอบการชำระเงิน"
      );

      setFile(null);
    } catch (error) {
      console.error(
        "PAYMENT SLIP ERROR =",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการส่งสลิป"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm sm:p-8">

      <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-emerald-700">
          Payment Slip
        </p>

        <h2 className="mt-2 text-2xl font-semibold text-stone-900">
          แจ้งหลักฐานการชำระเงิน
        </h2>

        <p className="mt-2 text-sm leading-7 text-stone-600">
          กรุณาแนบสลิปการโอนเงินเพื่อให้เจ้าหน้าที่ตรวจสอบ
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6"
      >

        <label
          htmlFor="payment-slip"
          className="block cursor-pointer rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-8 text-center transition hover:border-emerald-600 hover:bg-emerald-50"
        >

          <div className="text-4xl">
            📄
          </div>

          <p className="mt-3 font-medium text-stone-800">
            {file
              ? file.name
              : "เลือกไฟล์สลิป"}
          </p>

          <p className="mt-2 text-sm text-stone-500">
            JPG, PNG หรือ WEBP
            <br />
            ขนาดไม่เกิน 10 MB
          </p>

          <input
            id="payment-slip"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const selected =
                e.target.files?.[0] ||
                null;

              setFile(selected);
              setError("");
              setMessage("");
            }}
          />

        </label>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-7 text-emerald-800">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={
            loading || !file
          }
          className="mt-6 w-full rounded-full bg-emerald-800 px-6 py-4 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "กำลังส่งสลิป..."
            : "ส่งหลักฐานการชำระเงิน"}
        </button>

      </form>
    </section>
  );
}