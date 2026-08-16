import { supabase } from "@/lib/supabase";

export async function getBooking(bookingCode: string) {
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("booking_code", bookingCode)
    .single();

  if (error) {
    throw new Error("Booking not found");
  }

  return data;
}