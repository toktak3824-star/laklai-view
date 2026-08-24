"use client";

import { useRef, useState } from "react";

type Props = {
  orderCode: string;
};

const MAX_OUTPUT_SIZE = 1.5 * 1024 * 1024; // 1.5 MB
const MAX_IMAGE_WIDTH = 1800;

async function compressImage(file: File): Promise<File> {
  const imageUrl = URL.createObjectURL(file);

  try {
    const img = new Image();

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("ไม่สามารถอ่านรูปภาพได้"));
      img.src = imageUrl;
    });

    const scale = Math.min(
      1,
      MAX_IMAGE_WIDTH / img.naturalWidth
    );

    const width = Math.round(img.naturalWidth * scale);
    const height = Math.round(img.naturalHeight * scale);

    const canvas = document.createElement("canvas");

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("ไม่สามารถประมวลผลรูปภาพได้");
    }

    ctx.drawImage(img, 0, 0, width, height);

    let quality = 0.82;

    let blob: Blob | null = await new Promise((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", quality)
    );

    if (!blob) {
      throw new Error("ไม่สามารถสร้างไฟล์รูปภาพได้");
    }

    // ถ้ายังใหญ่เกินไป ให้ลดคุณภาพลงอีก
    while (blob.size > MAX_OUTPUT_SIZE && quality > 0.45) {
      quality -= 0.07;

      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", quality)
      );

      if (!blob) {
        throw new Error("ไม่สามารถบีบอัดรูปภาพได้");
      }
    }

    return new File(
      [blob],
      `${file.name.replace(/\.[^/.]+$/, "")}.jpg`,
      {
        type: "image/jpeg",
      }
    );
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

async function readResponse(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    if (response.status === 413) {
      throw new Error(
        "ไฟล์สลิปมีขนาดใหญ่เกินไป ระบบไม่สามารถรับไฟล์ได้"
      );
    }

    throw new Error(
      `เซิร์ฟเวอร์ส่งข้อมูลที่ไม่ถูกต้อง (${response.status})`
    );
  }
}

export default function CoffeeSlipUpload({
  orderCode,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleFileChange(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];

    setError("");
    setSuccess(false);

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "กรุณาเลือกไฟล์ JPG, PNG หรือ WEBP เท่านั้น"
      );

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    try {
      setLoading(true);

      const compressedFile =
        await compressImage(file);

      setSelectedFile(compressedFile);

      const url =
        URL.createObjectURL(compressedFile);

      setPreviewUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return url;
      });
    } catch (err) {
      console.error(
        "IMAGE COMPRESS ERROR =",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "ไม่สามารถเตรียมรูปสลิปได้"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload() {
    if (!selectedFile) {
      setError("กรุณาเลือกภาพสลิปก่อน");
      return;
    }

    if (!orderCode) {
      setError("ไม่พบเลขคำสั่งซื้อ");
      return;
    }

    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("orderCode", orderCode);
      formData.append("slip", selectedFile);

      const response = await fetch(
        "/api/coffee-orders/slip",
        {
          method: "POST",
          body: formData,
        }
      );

      const data =
        await readResponse(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.detail ||
            "ไม่สามารถส่งสลิปได้"
        );
      }

      console.log(
        "SLIP UPLOAD SUCCESS =",
        data
      );

      setSuccess(true);

      setSelectedFile(null);

      setPreviewUrl((oldUrl) => {
        if (oldUrl) {
          URL.revokeObjectURL(oldUrl);
        }

        return null;
      });

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      console.error(
        "SLIP UPLOAD ERROR =",
        err
      );

      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการส่งสลิป"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <div className="rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50 p-6 text-center">

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={loading}
          className="hidden"
          id="coffee-slip-upload"
        />

        <label
          htmlFor="coffee-slip-upload"
          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-stone-800 px-7 py-4 font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed"
        >
          {loading
            ? "กำลังเตรียมไฟล์..."
            : "เลือกรูปสลิป"}
        </label>

        {selectedFile && (
          <div className="mt-5">
            <p className="text-sm text-stone-600">
              ไฟล์ที่เตรียมส่ง:
            </p>

            <p className="mt-1 font-semibold text-stone-800">
              {selectedFile.name}
            </p>

            <p className="mt-1 text-sm text-emerald-700">
              ขนาดหลังย่อ:
              {" "}
              {(selectedFile.size / 1024 / 1024).toFixed(2)}
              {" MB"}
            </p>
          </div>
        )}

        {previewUrl && (
          <div className="mt-6 overflow-hidden rounded-2xl bg-white p-3 shadow">
            <img
              src={previewUrl}
              alt="ตัวอย่างสลิปการชำระเงิน"
              className="mx-auto max-h-[420px] w-full rounded-xl object-contain"
            />
          </div>
        )}

        {selectedFile && !success && (
          <button
            type="button"
            onClick={handleUpload}
            disabled={loading}
            className="mt-6 w-full rounded-full bg-emerald-700 px-7 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "กำลังส่งสลิป..."
              : "ส่งสลิปการชำระเงิน"}
          </button>
        )}

        {success && (
          <div className="mt-6 rounded-2xl border border-emerald-300 bg-emerald-50 p-5 text-emerald-800">
            <p className="text-xl font-bold">
              ✓ ส่งสลิปเรียบร้อยแล้ว
            </p>

            <p className="mt-2 text-sm leading-6">
              ระบบได้รับหลักฐานการชำระเงินแล้ว
              กรุณารอเจ้าหน้าที่ตรวจสอบ
            </p>

            <p className="mt-2 text-sm font-semibold">
              Order Code: {orderCode}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-5 rounded-2xl border border-red-300 bg-red-50 p-5 text-red-700">
            <p className="font-bold">
              ไม่สามารถส่งสลิปได้
            </p>

            <p className="mt-2 text-sm leading-6">
              {error}
            </p>
          </div>
        )}

        <p className="mt-5 text-sm leading-6 text-stone-500">
          รองรับ JPG, PNG และ WEBP
          <br />
          ระบบจะย่อขนาดภาพให้อัตโนมัติก่อนส่ง
        </p>

      </div>
    </div>
  );
}