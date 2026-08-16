"use client";

import { useEffect, useState } from "react";

export default function BookingTable() {
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    const res = await fetch("/api/admin/bookings");
    const data = await res.json();
    setBookings(data);
  }

  function roomName(roomId: string) {
    switch (roomId) {
      case "house1":
        return "บ้านสวนวิถี";
      case "house2":
        return "บ้านพักใจ";
      case "house3":
        return "บ้านแสงดาว";
      case "house4":
        return "บ้านสุขใจ";
      default:
        return roomId;
    }
  }

  // =========================================
  // แสดงรายละเอียดผู้เข้าพัก
  // =========================================

  function GuestDetails({ booking }: { booking: any }) {
    const adults = Number(booking.adults ?? 0);

    const childAges: number[] = Array.isArray(booking.child_ages)
      ? booking.child_ages.map(Number)
      : [];

    const youngChildren = childAges.filter(
      (age) => age >= 0 && age <= 8
    );

    const olderChildren = childAges.filter(
      (age) => age >= 9 && age <= 13
    );

    const adultChildren = childAges.filter(
      (age) => age >= 14
    );

    const effectiveAdults =
      adults + adultChildren.length;

    const totalGuests =
      adults + childAges.length;

    const needsExtraBed =
      adults >= 3 ||
      olderChildren.length > 0 ||
      youngChildren.length >= 2;

    return (
      <div className="min-w-[220px] space-y-2 text-sm">

        {/* จำนวนผู้ใหญ่ */}
        <div className="font-semibold text-stone-900">
          👨 ผู้ใหญ่: {effectiveAdults} คน
        </div>

        {/* เด็ก */}
        <div className="font-semibold text-stone-900">
          👶 เด็ก: {childAges.length} คน
        </div>

        {/* อายุเด็ก */}
        {childAges.length > 0 && (
          <div className="rounded-lg bg-stone-100 p-2 text-stone-700">
            <div className="font-medium">
              อายุเด็ก:
            </div>

            <div>
              {childAges.join(", ")} ปี
            </div>
          </div>
        )}

        {/* เด็กเล็ก */}
        {youngChildren.length > 0 && (
          <div className="text-green-700">
            🟢 เด็ก 0–8 ปี: {youngChildren.length} คน
            <div className="text-xs text-stone-500">
              ไม่มีค่าใช้จ่าย
            </div>
          </div>
        )}

        {/* เด็กโต */}
        {olderChildren.length > 0 && (
          <div className="text-orange-700">
            🟠 เด็ก 9–13 ปี: {olderChildren.length} คน
            <div className="text-xs text-stone-500">
              350 บาท/คน
            </div>
          </div>
        )}

        {/* เด็ก 14+ */}
        {adultChildren.length > 0 && (
          <div className="text-red-700">
            🔴 อายุ 14 ปีขึ้นไป: {adultChildren.length} คน
            <div className="text-xs text-stone-500">
              คิดเป็นผู้ใหญ่
            </div>
          </div>
        )}

        {/* รวมทั้งหมด */}
        <div className="border-t border-stone-200 pt-2 font-bold text-stone-900">
          👥 รวมทั้งหมด: {totalGuests} คน
        </div>

        {/* ที่นอนเสริม */}
        {needsExtraBed && (
          <div className="rounded-lg bg-amber-50 p-2 font-semibold text-amber-800">
            🛏️ ต้องเตรียมที่นอนเสริม
          </div>
        )}

      </div>
    );
  }

  return (
    <div className="mt-10 overflow-x-auto rounded-2xl bg-stone-50 p-6 shadow">

      <h2 className="mb-6 text-2xl font-bold text-stone-900">
        📋 รายการจองทั้งหมด
      </h2>

      <table className="w-full min-w-[1200px] text-stone-800">

        <thead>
          <tr className="border-b border-stone-300">

            <th className="py-3 text-left">
              เลขจอง
            </th>

            <th className="text-left">
              ลูกค้า
            </th>

            <th className="text-left">
              ผู้เข้าพัก
            </th>

            <th className="text-left">
              บ้านพัก
            </th>

            <th className="text-left">
              วันที่
            </th>

            <th className="text-left">
              ยอดเงิน
            </th>

            <th className="text-left">
              สลิป
            </th>

            <th className="text-left">
              สถานะ
            </th>

          </tr>
        </thead>

        <tbody>

          {bookings.map((booking) => (

            <tr
              key={booking.id}
              className="border-b border-stone-200 hover:bg-white"
            >

              {/* เลขจอง */}
              <td className="py-5 font-semibold">
                {booking.booking_code ?? "-"}
              </td>

              {/* ลูกค้า */}
              <td>
                <div className="font-semibold">
                  {booking.guest_name}
                </div>

                <div className="mt-1 text-xs text-stone-500">
                  {booking.email}
                </div>

                <div className="text-xs text-stone-500">
                  {booking.phone}
                </div>
              </td>

              {/* ผู้เข้าพัก */}
              <td>
                <GuestDetails booking={booking} />
              </td>

              {/* บ้านพัก */}
              <td className="font-medium">
                {roomName(booking.room_id)}
              </td>

              {/* วันที่ */}
              <td>
                <div>
                  {booking.check_in}
                </div>

                <div>
                  ถึง
                </div>

                <div>
                  {booking.check_out}
                </div>
              </td>

              {/* ยอดเงิน */}
              <td className="font-semibold">
                ฿
                {Number(
                  booking.total_price
                ).toLocaleString()}
              </td>

              {/* สลิป */}
              <td>
                {booking.slip_url ? (
                  <a
                    href={booking.slip_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700"
                  >
                    ดูสลิป
                  </a>
                ) : (
                  <span className="text-sm text-stone-400">
                    ยังไม่มีสลิป
                  </span>
                )}
              </td>

              {/* สถานะ */}
              <td className="space-y-2">

                {booking.booking_status === "pending" && (
                  <div className="flex flex-wrap gap-2">

                    {/* อนุมัติ */}
                    <button
                      type="button"
                      onClick={async () => {

                        const confirmed =
                          window.confirm(
                            `ต้องการยืนยันการจอง ${booking.booking_code} ใช่หรือไม่?`
                          );

                        if (!confirmed) {
                          return;
                        }

                        try {

                          const response =
                            await fetch(
                              "/api/admin/confirm",
                              {
                                method: "POST",
                                headers: {
                                  "Content-Type":
                                    "application/json",
                                },
                                body:
                                  JSON.stringify({
                                    id: booking.id,
                                  }),
                              }
                            );

                          const data =
                            await response.json();

                          if (!response.ok) {
                            throw new Error(
                              data.error ||
                                "ไม่สามารถยืนยันการจองได้"
                            );
                          }

                          alert(
                            "ยืนยันการจองเรียบร้อยแล้ว\nระบบกำลังส่งอีเมลให้ลูกค้า"
                          );

                          await loadBookings();

                        } catch (error) {

                          console.error(
                            "CONFIRM BOOKING ERROR =",
                            error
                          );

                          alert(
                            "ไม่สามารถยืนยันการจองได้ กรุณาลองใหม่อีกครั้ง"
                          );
                        }

                      }}
                      className="rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                    >
                      อนุมัติ
                    </button>

                    {/* ยกเลิก */}
                    <button
  type="button"
  onClick={async () => {
    const reason = window.prompt(
      "กรุณาระบุเหตุผลในการยกเลิกการจอง\n\n" +
      "ตัวอย่าง:\n" +
      "1. หลักฐานการโอนเงินไม่ครบ\n" +
      "2. พบความผิดปกติของการโอนเงิน\n" +
      "3. จำนวนผู้เข้าพักไม่ตรงกับที่แจ้ง\n" +
      "4. จำนวนผู้เข้าพักเกินความสามารถของบ้านพัก\n" +
      "5. อื่น ๆ"
    );

    if (!reason || !reason.trim()) {
      alert("กรุณาระบุเหตุผลก่อนยกเลิกการจอง");
      return;
    }

    const confirmed = window.confirm(
      `ยืนยันการยกเลิกการจอง ${booking.booking_code} หรือไม่?\n\n` +
      `เหตุผล:\n${reason}`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/admin/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: booking.id,
          reason: reason.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "ไม่สามารถยกเลิกการจองได้"
        );
      }

      alert(
        "ยกเลิกการจองเรียบร้อยแล้ว\n" +
        "ระบบกำลังส่งอีเมลแจ้งลูกค้า"
      );

      await loadBookings();

    } catch (error) {
      console.error(
        "CANCEL BOOKING ERROR =",
        error
      );

      alert(
        "ไม่สามารถยกเลิกการจองได้ กรุณาลองใหม่อีกครั้ง"
      );
    }
  }}
  className="rounded bg-red-600 px-3 py-2 text-white hover:bg-red-700"
>
  ยกเลิก
</button>

                  </div>
                )}

                {/* สถานะ */}
                <span
                  className={
                    booking.booking_status ===
                    "confirmed"
                      ? "inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
                      : booking.booking_status ===
                        "cancelled"
                      ? "inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700"
                      : "inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700"
                  }
                >
                  {booking.booking_status ===
                  "pending"
                    ? "รอตรวจสอบ"
                    : booking.booking_status ===
                      "confirmed"
                    ? "ยืนยันแล้ว"
                    : booking.booking_status ===
                      "cancelled"
                    ? "ยกเลิก"
                    : booking.booking_status}
                </span>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  );
}