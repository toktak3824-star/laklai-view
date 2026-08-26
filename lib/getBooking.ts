export async function getBooking(bookingCode: string) {
  const response = await fetch(
    `/api/bookings/get?bookingCode=${encodeURIComponent(
      bookingCode
    )}`,
    {
      method: "GET",
      cache: "no-store",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result?.error || "Booking not found"
    );
  }

  return result.booking;
}