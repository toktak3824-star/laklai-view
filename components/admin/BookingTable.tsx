"use client";

import { useEffect, useState } from "react";

type Payment = {
  id: string;
  amount: number;
  verified: boolean;
  slip_url?: string | null;
  created_at?: string;
};

type Booking = {
  id: string;
  booking_code?: string;
  guest_name?: string;
  email?: string;
  phone?: string;
  room_id: string;
  check_in: string;
  check_out: string;
  adults?: number;
  child_ages?: number[];
  children?: number;
  total_price: number;
  booking_status: string;
  payment_status: string;
  slip_url?: string | null;
  nature_experience_selected?: boolean;
  nature_experience_date?: string;
  nature_experience_participants?: number;
  nature_experience_total?: number;
  dinner_items?: {
    id?: string | number;
    name?: string;
    quantity?: number | string;
    price?: number | string;
  }[];
  dinner_total?: number;
  payments?: Payment[];
  received_amount?: number;
  remaining_amount?: number | null;
  has_payment_history?: boolean;
  needs_payment_review?: boolean;
};

const money = (value: number) =>
  `฿${Number(value || 0).toLocaleString("th-TH")}`;

export default function BookingTable() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    loadBookings();
  }, []);

  async function loadBookings() {
    try {
      setLoading(true);
      setLoadError("");

      const res = await fetch("/api/admin/bookings", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "โหลดข้อมูลไม่สำเร็จ");
      }

      if (!Array.isArray(data)) {
        throw new Error("รูปแบบข้อมูลรายการจองไม่ถูกต้อง");
      }

      setBookings(data);
    } catch (error) {
      console.error("LOAD BOOKINGS ERROR =", error);

      setLoadError(
        error instanceof Error
          ? error.message
          : "ไม่สามารถโหลดรายการจองได้"
      );
    } finally {
      setLoading(false);
    }
  }

  function roomName(roomId: string) {
    switch (roomId) {
      case "house1":
        return "บ้านสวนวิถี";
      case "house2":
        return "บ้านพักใจ";
      case "house3":
        return "บ้านอุ่นใจ";
      case "house4":
        return "บ้านสุขใจ";
      default:
        return roomId;
    }
  }

  // =========================================
  // คำนวณข้อมูลสรุปรายได้
  // =========================================

  const confirmedBookings = bookings.filter(
    (booking) => booking.booking_status === "confirmed"
  );

  const cancelledBookings = bookings.filter(
    (booking) => booking.booking_status === "cancelled"
  );

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.booking_status !== "confirmed" &&
      booking.booking_status !== "cancelled"
  );

  const confirmedTotal = confirmedBookings.reduce(
    (sum, booking) => sum + Number(booking.total_price || 0),
    0
  );

  const receivedTotal = confirmedBookings.reduce(
    (sum, booking) => sum + Number(booking.received_amount || 0),
    0
  );

  const bookingsWithPaymentHistory = confirmedBookings.filter(
    (booking) => booking.has_payment_history
  );

  const remainingTotal = bookingsWithPaymentHistory.reduce(
    (sum, booking) => sum + Number(booking.remaining_amount || 0),
    0
  );

  const needsReviewCount = confirmedBookings.filter(
    (booking) => booking.needs_payment_review
  ).length;

  // =========================================
  // แสดงรายละเอียดผู้เข้าพัก
  // =========================================

  function GuestDetails({ booking }: { booking: Booking }) {
    const adults = Number(booking.adults ?? 0);

    const childAges = Array.isArray(booking.child_ages)
      ? booking.child_ages.map(Number)
      : [];

    const youngChildren = childAges.filter(
      (age) => age >= 0 && age <= 8
    );

    const olderChildren = childAges.filter(
      (age) => age >= 9 && age <= 14
    );

    const adultChildren = childAges.filter(
      (age) => age >= 15
    );

    const effectiveAdults = adults + adultChildren.length;

    const totalGuests =
      adults + childAges.length;

    const needsExtraBed =
      effectiveAdults >= 3 ||
      olderChildren.length > 0 ||
      youngChildren.length >= 2;

    return (
      <div className="min-w-[220px] space-y-2 text-sm">
        <div className="font-semibold text-stone-900">
          👨 ผู้ใหญ่: {effectiveAdults} คน
        </div>

        <div className="font-semibold text-stone-900">
          👶 เด็ก: {childAges.length} คน
        </div>

        {childAges.length > 0 && (
          <div className="rounded-lg bg-stone-100 p-2 text-stone-700">
            <div className="font-medium">อายุเด็ก:</div>
            <div>{childAges.join(", ")} ปี</div>
          </div>
        )}

        {youngChildren.length > 0 && (
          <div className="text-green-700">
            🟢 เด็ก 0–8 ปี: {youngChildren.length} คน
            <div className="text-xs text-stone-500">
              ไม่มีค่าใช้จ่าย
            </div>
          </div>
        )}

        {olderChildren.length > 0 && (
          <div className="text-orange-700">
            🟠 เด็ก 9–14 ปี: {olderChildren.length} คน
            <div className="text-xs text-stone-500">
              350 บาท/คน
            </div>
          </div>
        )}

        {adultChildren.length > 0 && (
          <div className="text-red-700">
            🔴 อายุ 15 ปีขึ้นไป: {adultChildren.length} คน
            <div className="text-xs text-stone-500">
              คิดเป็นผู้ใหญ่
            </div>
          </div>
        )}

        <div className="border-t border-stone-200 pt-2 font-bold text-stone-900">
          👥 รวมทั้งหมด: {totalGuests} คน
        </div>

        {needsExtraBed && (
          <div className="rounded-lg bg-amber-50 p-2 font-semibold text-amber-800">
            🛏️ ต้องเตรียมที่นอนเสริม
          </div>
        )}
      </div>
    );
  }

  // =========================================
  // แสดงอาหารเย็น
  // =========================================

  function DinnerDetails({ booking }: { booking: Booking }) {
    const dinnerItems = Array.isArray(booking.dinner_items)
      ? booking.dinner_items
      : [];

    if (dinnerItems.length === 0) {
      return (
        <span className="text-sm text-stone-400">
          ไม่ได้สั่งล่วงหน้า
        </span>
      );
    }

    return (
      <div className="min-w-[230px] rounded-xl bg-orange-50 p-3 text-sm">
        <div className="mb-2 font-bold text-orange-800">
          🍽️ อาหารเย็นสั่งล่วงหน้า
        </div>

        <div className="space-y-2">
          {dinnerItems.map((item, index) => (
            <div
              key={`${item.id ?? "dinner"}-${index}`}
              className="border-b border-orange-100 pb-2 last:border-b-0 last:pb-0"
            >
              <div className="font-semibold text-stone-800">
                {item.name ?? "ไม่ระบุชื่ออาหาร"}
              </div>

              <div className="text-stone-600">
                จำนวน {Number(item.quantity ?? 0)} ที่
              </div>

              {Number(item.price ?? 0) > 0 && (
                <div className="text-xs text-stone-500">
                  ฿{Number(item.price).toLocaleString()} / ที่
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-orange-200 pt-2 font-bold text-orange-800">
          รวมค่าอาหาร: {money(Number(booking.dinner_total ?? 0))}
        </div>
      </div>
    );
  }

  // =========================================
  // ยืนยันการจองและบันทึกเงินจริง
  // =========================================

  async function confirmBooking(booking: Booking) {
    const total = Number(booking.total_price || 0);

    const suggestedDeposit =
      total >= 4000
        ? Math.ceil(total / 2)
        : total;

    if (!booking.slip_url) {
      alert("ยังไม่มีสลิป กรุณาตรวจสอบก่อนอนุมัติ");
      return;
    }

    const amountInput = window.prompt(
      `ตรวจสอบยอดชำระของ ${booking.booking_code}\n\n` +
        `มูลค่าการจอง: ${money(total)}\n` +
        `ยอดมัดจำที่แนะนำ: ${money(suggestedDeposit)}\n\n` +
        `กรอกยอดเงินจริงตามสลิปที่ตรวจสอบแล้ว (บาท)`
    );

    if (amountInput === null) {
      return;
    }

    const amount = Number(amountInput.replace(/,/g, "").trim());

    if (
      !Number.isSafeInteger(amount) ||
      amount <= 0 ||
      amount > total
    ) {
      alert("กรุณากรอกยอดเงินจริงเป็นจำนวนเต็ม และไม่เกินมูลค่าการจอง");
      return;
    }

    const confirmed = window.confirm(
      `ยืนยันการรับเงินและการจองหรือไม่?\n\n` +
        `เลขจอง: ${booking.booking_code}\n` +
        `มูลค่าการจอง: ${money(total)}\n` +
        `รับเงินจริง: ${money(amount)}\n` +
        `ยอดคงเหลือหลังรายการนี้: ${money(total - amount)}`
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch("/api/admin/bookings/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: booking.id,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "ไม่สามารถบันทึกการชำระเงินได้"
        );
      }

      alert(
        `บันทึกยอดรับเงินจริงเรียบร้อยแล้ว\n\n` +
          `ยอดรับสะสม: ${money(data.receivedAmount)}\n` +
          `ยอดคงเหลือ: ${money(data.remainingAmount)}\n` +
          `อีเมล: ${data.emailSent ? "ส่งแล้ว" : "ไม่ได้ส่ง"}`
      );

      await loadBookings();
    } catch (error) {
      console.error("CONFIRM BOOKING ERROR =", error);

      alert(
        error instanceof Error
          ? error.message
          : "ไม่สามารถยืนยันการจองได้"
      );
    }
  }

  // =========================================
  // ยกเลิกการจอง
  // =========================================

  async function cancelBooking(booking: Booking) {
    const reason = window.prompt(
      "กรุณาระบุเหตุผลในการยกเลิกการจอง\n\n" +
        "ตัวอย่าง:\n" +
        "1. ลูกค้าขอยกเลิกการจอง\n" +
        "2. ตรวจพบปัญหาเกี่ยวกับการจอง\n" +
        "3. บ้านพักไม่สามารถให้บริการได้\n" +
        "4. อื่น ๆ"
    );

    if (!reason || !reason.trim()) {
      alert("กรุณาระบุเหตุผลก่อนยกเลิกการจอง");
      return;
    }

    const confirmed = window.confirm(
      `ยืนยันการยกเลิกการจอง ${booking.booking_code} หรือไม่?\n\n` +
        `เหตุผล:\n${reason.trim()}`
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

      if (data.emailSent === false) {
        alert(
          "ยกเลิกการจองเรียบร้อยแล้ว แต่ส่งอีเมลไม่สำเร็จ\n" +
            "กรุณาตรวจสอบภายหลัง"
        );
      } else {
        alert("ยกเลิกการจองเรียบร้อยแล้ว");
      }

      await loadBookings();
    } catch (error) {
      console.error("CANCEL BOOKING ERROR =", error);

      alert(
        error instanceof Error
          ? error.message
          : "ไม่สามารถยกเลิกการจองได้"
      );
    }
  }

  // =========================================
  // หน้าจอ
  // =========================================

  if (loading) {
    return (
      <div className="mt-10 rounded-2xl bg-stone-50 p-8 text-center">
        กำลังโหลดข้อมูลการจอง...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="mt-10 rounded-2xl bg-red-50 p-6 text-red-700">
        <p className="font-bold">โหลดข้อมูลไม่สำเร็จ</p>
        <p>{loadError}</p>
        <button
          onClick={loadBookings}
          className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-white"
        >
          ลองอีกครั้ง
        </button>
      </div>
    );
  }

  return (
    <div className="mt-10 space-y-6">

      {/* ===================================== */}
      {/* สรุปรายได้ */}
      {/* ===================================== */}

      <section className="rounded-2xl bg-stone-50 p-6 shadow">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold text-stone-900">
            📊 สรุปรายได้ หลักลาย view วิถีบ้านป่า
          </h2>

          <button
            onClick={loadBookings}
            className="rounded-lg bg-stone-800 px-4 py-2 text-white hover:bg-stone-700"
          >
            ↻ รีเฟรชข้อมูล
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
            <div className="text-sm text-blue-700">
              มูลค่าการจองที่ยืนยันแล้ว
            </div>
            <div className="mt-2 text-2xl font-bold text-blue-900">
              {money(confirmedTotal)}
            </div>
            <div className="mt-1 text-xs text-blue-700">
              {confirmedBookings.length} รายการ
            </div>
          </div>

          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <div className="text-sm text-green-700">
              เงินรับจริงที่ตรวจสอบแล้ว
            </div>
            <div className="mt-2 text-2xl font-bold text-green-900">
              {money(receivedTotal)}
            </div>
            <div className="mt-1 text-xs text-green-700">
              จากรายการ confirmed
            </div>
          </div>

          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <div className="text-sm text-orange-700">
              ยอดคงเหลือที่มีข้อมูลรองรับ
            </div>
            <div className="mt-2 text-2xl font-bold text-orange-900">
              {money(remainingTotal)}
            </div>
            <div className="mt-1 text-xs text-orange-700">
              เฉพาะรายการที่มีประวัติชำระเงิน
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="text-sm text-amber-700">
              รายการเก่าที่ต้องตรวจสอบ
            </div>
            <div className="mt-2 text-2xl font-bold text-amber-900">
              {needsReviewCount}
            </div>
            <div className="mt-1 text-xs text-amber-700">
              ไม่มีประวัติรับเงินจริงในระบบ
            </div>
          </div>

          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="text-sm text-red-700">
              รายการยกเลิก
            </div>
            <div className="mt-2 text-2xl font-bold text-red-900">
              {cancelledBookings.length}
            </div>
            <div className="mt-1 text-xs text-red-700">
              ไม่นำมารวมเป็นรายได้
            </div>
          </div>

        </div>

        <div className="mt-4 rounded-xl bg-white p-4 text-sm text-stone-600">
          <p>
            รายการยืนยันแล้วทั้งหมด {confirmedBookings.length} รายการ
            {" · "}
            รอตรวจสอบ {pendingBookings.length} รายการ
            {" · "}
            ยกเลิก {cancelledBookings.length} รายการ
          </p>

          {needsReviewCount > 0 && (
            <p className="mt-2 text-amber-700">
              ⚠️ มีรายการจองเก่าที่ยังไม่มีประวัติการรับเงินจริง
              จึงยังไม่นำยอดเหล่านั้นมาคำนวณเป็นเงินคงเหลือ
            </p>
          )}
        </div>
      </section>

      {/* ===================================== */}
      {/* ตารางรายการจอง */}
      {/* ===================================== */}

      <section className="overflow-x-auto rounded-2xl bg-stone-50 p-6 shadow">

        <h2 className="mb-6 text-2xl font-bold text-stone-900">
          📋 รายการจองทั้งหมด
        </h2>

        <table className="w-full min-w-[1550px] text-stone-800">

          <thead>
            <tr className="border-b border-stone-300">

              <th className="py-3 text-left">เลขจอง</th>
              <th className="text-left">ลูกค้า</th>
              <th className="text-left">ผู้เข้าพัก</th>
              <th className="text-left">บ้านพัก</th>
              <th className="text-left">วันที่</th>
              <th className="text-left">วิถีบ้านป่า</th>
              <th className="text-left">🍽️ อาหารล่วงหน้า</th>
              <th className="text-left">มูลค่าจอง</th>
              <th className="text-left">รับเงินจริง</th>
              <th className="text-left">คงเหลือ</th>
              <th className="text-left">สลิป</th>
              <th className="text-left">สถานะ</th>

            </tr>
          </thead>

          <tbody>

            {bookings.map((booking) => (

              <tr
                key={booking.id}
                className="border-b border-stone-200 hover:bg-white"
              >

                <td className="py-5 font-semibold">
                  {booking.booking_code ?? "-"}
                </td>

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

                <td>
                  <GuestDetails booking={booking} />
                </td>

                <td className="font-medium">
                  {roomName(booking.room_id)}
                </td>

                <td>
                  <div>{booking.check_in}</div>
                  <div>ถึง</div>
                  <div>{booking.check_out}</div>
                </td>

                <td>
                  {booking.nature_experience_selected &&
                  Number(booking.nature_experience_participants ?? 0) > 0 ? (
                    <div className="min-w-[190px] rounded-xl bg-green-50 p-3 text-sm">

                      <div className="font-bold text-green-800">
                        🌿 วิถีบ้านป่า
                      </div>

                      <div className="mt-1 text-stone-700">
                        📅 {booking.nature_experience_date ?? "-"}
                      </div>

                      <div className="text-stone-700">
                        👥 {Number(booking.nature_experience_participants ?? 0)} คน
                      </div>

                      <div className="font-semibold text-green-700">
                        💰 {money(Number(booking.nature_experience_total ?? 0))}
                      </div>

                    </div>
                  ) : (
                    <span className="text-sm text-stone-400">
                      ไม่ได้เลือก
                    </span>
                  )}
                </td>

                <td>
                  <DinnerDetails booking={booking} />
                </td>

                <td className="font-semibold">
                  {money(Number(booking.total_price))}
                </td>

                <td>
                  <div className="font-semibold text-green-700">
                    {money(Number(booking.received_amount || 0))}
                  </div>

                  {booking.payments?.length ? (
                    <div className="mt-1 text-xs text-stone-500">
                      {booking.payments.length} รายการชำระ
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-amber-700">
                      ยังไม่มีประวัติ
                    </div>
                  )}
                </td>

                <td>
                  {booking.remaining_amount === null ? (
                    <span className="text-xs text-amber-700">
                      รอตรวจสอบ
                    </span>
                  ) : (
                    <span className="font-semibold text-orange-700">
                      {money(Number(booking.remaining_amount))}
                    </span>
                  )}
                </td>

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

                <td className="space-y-2">

                  {booking.booking_status === "pending" && (
                    <button
                      type="button"
                      onClick={() => confirmBooking(booking)}
                      className="block rounded-lg bg-green-600 px-3 py-2 text-white hover:bg-green-700"
                    >
                      อนุมัติ / บันทึกเงิน
                    </button>
                  )}

                  {(booking.booking_status === "pending" ||
                    booking.booking_status === "confirmed") && (
                    <button
                      type="button"
                      onClick={() => cancelBooking(booking)}
                      className="block rounded-lg bg-red-600 px-3 py-2 text-white hover:bg-red-700"
                    >
                      ยกเลิกการจอง
                    </button>
                  )}

                  {booking.needs_payment_review && (
                    <div className="rounded-lg bg-amber-50 p-2 text-xs font-semibold text-amber-800">
                      ⚠️ ต้องตรวจสอบยอดเก่า
                    </div>
                  )}

                  <span
                    className={
                      booking.booking_status === "confirmed"
                        ? "inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700"
                        : booking.booking_status === "cancelled"
                        ? "inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700"
                        : "inline-block rounded-full bg-yellow-100 px-3 py-1 text-sm font-semibold text-yellow-700"
                    }
                  >
                    {booking.booking_status === "pending"
                      ? "รอตรวจสอบ"
                      : booking.booking_status === "confirmed"
                      ? "ยืนยันแล้ว"
                      : booking.booking_status === "cancelled"
                      ? "ยกเลิก"
                      : booking.booking_status}
                  </span>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </section>

    </div>
  );
}