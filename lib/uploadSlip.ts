import { supabase } from "./supabase";

export async function uploadSlip(file: File) {
  try {
    if (!file) {
      throw new Error("ไม่พบไฟล์สลิป");
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("ไฟล์สลิปต้องเป็นรูปภาพเท่านั้น");
    }

    const fileName =
      `${Date.now()}-${file.name.replace(/\s+/g, "-")}`;

    console.log("กำลังอัปโหลดไฟล์:", fileName);
    console.log("ขนาดไฟล์:", file.size);
    console.log("ประเภทไฟล์:", file.type);

    const { data, error } = await supabase.storage
      .from("payment-slips")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("SUPABASE STORAGE ERROR:", error);

      throw new Error(
        `อัปโหลดสลิปไม่สำเร็จ: ${error.message}`
      );
    }

    console.log("อัปโหลดสำเร็จ:", data);

    const { data: publicUrlData } = supabase.storage
      .from("payment-slips")
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    if (!publicUrl) {
      throw new Error("ไม่สามารถสร้าง URL ของสลิปได้");
    }

    console.log("Slip URL:", publicUrl);

    return publicUrl;

  } catch (error) {
    console.error("UPLOAD SLIP ERROR:", error);

    throw error;
  }
}