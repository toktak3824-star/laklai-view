import "server-only";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function getBooking(
  bookingCode: string
) {
  const code = String(bookingCode ?? "").trim();

  if (!code) {
    throw new Error("ไม่พบรหัสการจอง");
  }

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("booking_code", code)
    .maybeSingle();

  if (error) {
    console.error(
      "GET BOOKING ERROR =",
      error
    );

    throw new Error(
      "ไม่สามารถค้นหาข้อมูลการจองได้"
    );
  }

  if (!data) {
    throw new Error(
      "ไม่พบข้อมูลการจอง"
    );
  }

  return data;
}