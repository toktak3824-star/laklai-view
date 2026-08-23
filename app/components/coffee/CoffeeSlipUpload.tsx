"use client";

import { useState } from "react";

type CoffeeSlipUploadProps = {
  orderCode: string;
};

export default function CoffeeSlipUpload({
  orderCode,
}: CoffeeSlipUploadProps) {
  const [file, setFile] =
    useState<File | null>(null);

  const [preview, setPreview] =
    useState<string>("");

  const [loading, setLoading] =
    useState(false);

  const [success, setSuccess] =
    useState(false);

  const [error, setError] =
    useState("");

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    setError("");
    setSuccess(false);

    const selectedFile =
      event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (
      !allowedTypes.includes(
        selectedFile.type
      )
    ) {
      setError(
        "กรุณาเลือกไฟล์ JPG, PNG หรือ WEBP"
      );

      setFile(null);
      setPreview("");

      return;
    }

    if (
      selectedFile.size >
      5 * 1024 * 1024
    ) {
      setError(
        "ไฟล์สลิปต้องมีขนาดไม่เกิน 5 MB"
      );

      setFile(null);
      setPreview("");

      return;
    }

    setFile(selectedFile);

    const previewUrl =
      URL.createObjectURL(selectedFile);

    setPreview(previewUrl);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!file) {
      setError(
        "กรุณาเลือกสลิปการชำระเงินก่อน"
      );

      return;
    }

    try {
      setLoading(true);

      const formData =
        new FormData();

      formData.append(
        "orderCode",
        orderCode
      );

      formData.append(
        "slip",
        file
      );

      const response =
        await fetch(
          "/api/coffee-payment/submit-slip",
          {
            method: "POST",
            body: formData,
          }
        );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "ไม่สามารถส่งสลิปได้"
        );
      }

      setSuccess(true);

      setFile(null);

      setPreview("");

    } catch (error) {
      console.error(
        "SLIP SUBMIT ERROR =",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่"
      );

    } finally {
      setLoading(false);
    }
  }

  // =========================================
  // หลังส่งสลิปสำเร็จ
  // =========================================

  if (success) {
    return (
      <div className="rounded-3xl border border-emerald-900/50 bg-emerald-950/40 p-8 text-center">

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-700 text-3xl">
          ✓
        </div>

        <h3 className="mt-5 text-2xl font-semibold text-white">
          ส่งสลิปเรียบร้อยแล้ว
        </h3>

        <p className="mt-3 leading-8 text-stone-300">
          เราได้รับหลักฐานการชำระเงินของคุณแล้ว
          <br />
          กรุณารอเจ้าหน้าที่ตรวจสอบการชำระเงิน
        </p>

        <div className="mt-6 rounded-2xl bg-[#171b16] p-5">
          <p className="text-sm text-stone-500">
            Order Code
          </p>

          <p className="mt-1 text-lg font-semibold text-emerald-400">
            {orderCode}
          </p>
        </div>

      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-stone-200 bg-white p-7 shadow-sm"
    >

      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-emerald-700">
          PAYMENT CONFIRMATION
        </p>

        <h3 className="mt-3 text-3xl font-semibold text-stone-900">
          แนบสลิปการชำระเงิน
        </h3>

        <p className="mt-4 leading-8 text-stone-600">
          หลังจากชำระเงินเรียบร้อยแล้ว
          กรุณาแนบภาพสลิปเพื่อยืนยันคำสั่งซื้อ
        </p>
      </div>

      {/* =====================================
          ORDER CODE
      ===================================== */}

      <div className="mt-7 rounded-2xl bg-stone-100 p-5">

        <p className="text-sm text-stone-500">
          Order Code
        </p>

        <p className="mt-1 text-xl font-semibold text-emerald-700">
          {orderCode}
        </p>

      </div>

      {/* =====================================
          FILE INPUT
      ===================================== */}

      <label className="mt-7 block">

        <span className="mb-2 block text-sm font-medium text-stone-700">
          รูปสลิปการโอนเงิน
        </span>

        <input
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={loading}
          className="block w-full cursor-pointer rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-5 text-sm text-stone-600 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-700 file:px-5 file:py-2.5 file:font-semibold file:text-white hover:border-emerald-500"
        />

      </label>

      {/* =====================================
          FILE NAME
      ===================================== */}

      {file && (
        <div className="mt-4 rounded-2xl bg-stone-100 p-4">

          <p className="text-sm text-stone-500">
            ไฟล์ที่เลือก
          </p>

          <p className="mt-1 break-all font-medium text-stone-800">
            {file.name}
          </p>

        </div>
      )}

      {/* =====================================
          PREVIEW
      ===================================== */}

      {preview && (
        <div className="mt-6 overflow-hidden rounded-3xl border border-stone-200 bg-stone-50 p-3">

          <p className="px-3 pb-3 text-sm font-medium text-stone-600">
            ตัวอย่างสลิป
          </p>

          <img
            src={preview}
            alt="ตัวอย่างสลิปการชำระเงิน"
            className="mx-auto max-h-[500px] rounded-2xl object-contain"
          />

        </div>
      )}

      {/* =====================================
          ERROR
      ===================================== */}

      {error && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-center text-red-700">
          {error}
        </div>
      )}

      {/* =====================================
          SUBMIT
      ===================================== */}

      <button
        type="submit"
        disabled={loading || !file}
        className="mt-7 w-full rounded-full bg-emerald-700 px-8 py-4 text-lg font-semibold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "กำลังส่งสลิป..."
          : "ส่งสลิปการชำระเงิน"}
      </button>

      <p className="mt-4 text-center text-sm leading-7 text-stone-500">
        รองรับ JPG, PNG และ WEBP
        ขนาดไม่เกิน 5 MB
      </p>

    </form>
  );
}