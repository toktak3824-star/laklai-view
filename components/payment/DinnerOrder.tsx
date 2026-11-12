"use client";

import { useMemo, useState } from "react";
import { DINNER_MENU } from "@/data/dinnerMenu";

type DinnerItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type Booking = {
  id: string;
  booking_code: string;
  email?: string | null;
  guest_name?: string;
  check_in: string;
  check_out?: string;
  nature_experience_selected?: boolean;
  dinner_items?: DinnerItem[];
  dinner_total?: number;
};

type Props = {
  booking: Booking;
};

type VerifiedBooking = {
  booking_code: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  dinner_items: DinnerItem[];
  dinner_total: number;
  nature_experience_selected: boolean;
};

export default function DinnerOrder({ booking }: Props) {
  const [bookingCode, setBookingCode] = useState(
    booking.booking_code
  );

  const [email, setEmail] = useState(
    booking.email ?? ""
  );

  const [verified, setVerified] = useState(
    Boolean(booking.booking_code)
  );

  const [verifiedBooking, setVerifiedBooking] =
    useState<VerifiedBooking | null>({
      booking_code: booking.booking_code,
      guest_name: booking.guest_name ?? "",
      check_in: booking.check_in,
      check_out: booking.check_out ?? "",
      dinner_items: booking.dinner_items ?? [],
      dinner_total: Number(booking.dinner_total ?? 0),
      nature_experience_selected: Boolean(
        booking.nature_experience_selected
      ),
    });

  const [quantities, setQuantities] = useState<
    Record<string, number>
  >(() => {
    const initial: Record<string, number> = {};

    for (const item of booking.dinner_items ?? []) {
      initial[item.id] = Number(item.quantity) || 0;
    }

    return initial;
  });

  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error" | ""
  >("");

  // =====================================
  // คำนวณรายการอาหาร
  // =====================================

  const items = useMemo(
    () =>
      DINNER_MENU.filter(
        (item) => (quantities[item.id] ?? 0) > 0
      ).map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: quantities[item.id],
      })),
    [quantities]
  );

  const total = items.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  // =====================================
  // จัดลำดับหมวดอาหาร
  // =====================================

  const categoryOrder = [
    "ชุดอาหาร",
    "เมนูซิกเนเจอร์",
    "กับข้าว",
    "ข้าว",
    "อาหารจานเดียว",
  ];

  const groupedMenu = useMemo(() => {
    const groups: Record<string, typeof DINNER_MENU> = {};

    for (const category of categoryOrder) {
      groups[category] = DINNER_MENU.filter(
        (item) => item.category === category
      );
    }

    return groups;
  }, []);

  // =====================================
  // เพิ่ม / ลดจำนวนอาหาร
  // =====================================

  const updateQuantity = (
    id: string,
    value: number
  ) => {
    const safeValue = Math.max(
      0,
      Math.min(20, Math.floor(value))
    );

    setQuantities((current) => ({
      ...current,
      [id]: safeValue,
    }));

    setMessage("");
    setMessageType("");
  };

  // =====================================
  // ตรวจสอบ Booking Code + Email
  // สำหรับลูกค้าที่กลับมาสั่งอาหารเพิ่ม
  // =====================================

  const handleVerify = async () => {
    if (verifying) return;

    const code = bookingCode.trim();
    const customerEmail = email.trim().toLowerCase();

    if (!code) {
      setMessage("กรุณากรอก Booking Code");
      setMessageType("error");
      return;
    }

    if (!customerEmail) {
      setMessage("กรุณากรอกอีเมลที่ใช้จอง");
      setMessageType("error");
      return;
    }

    setVerifying(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        "/api/dinner-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "verify",
            booking_code: code,
            email: customerEmail,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "ไม่สามารถตรวจสอบการจองได้"
        );
      }

      if (result.nature_experience_selected) {
        setVerifiedBooking({
          booking_code: result.booking_code ?? code,
          guest_name: result.guest_name ?? "",
          check_in: result.check_in ?? "",
          check_out: result.check_out ?? "",
          dinner_items: [],
          dinner_total: 0,
          nature_experience_selected: true,
        });

        setQuantities({});
        setVerified(true);

        setMessage(
          result.message ||
            "การจองนี้รวมอาหาร 3 มื้อแล้ว"
        );

        setMessageType("success");
        return;
      }

      const savedItems: DinnerItem[] =
        Array.isArray(result.dinner_items)
          ? result.dinner_items
          : [];

      const nextQuantities: Record<string, number> = {};

      for (const savedItem of savedItems) {
        const menuItem = DINNER_MENU.find(
          (item) => item.id === savedItem.id
        );

        if (menuItem) {
          nextQuantities[menuItem.id] =
            Number(savedItem.quantity) || 0;
        }
      }

      setQuantities(nextQuantities);

      setVerifiedBooking({
        booking_code: result.booking_code,
        guest_name: result.guest_name ?? "",
        check_in: result.check_in,
        check_out: result.check_out,
        dinner_items: savedItems,
        dinner_total: Number(result.dinner_total ?? 0),
        nature_experience_selected: false,
      });

      setVerified(true);

      setMessage(
        "ตรวจสอบการจองเรียบร้อยแล้ว สามารถเลือกอาหารได้"
      );

      setMessageType("success");

    } catch (error) {
      setVerified(false);
      setVerifiedBooking(null);

      setMessage(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการตรวจสอบ"
      );

      setMessageType("error");

    } finally {
      setVerifying(false);
    }
  };

  // =====================================
  // บันทึกรายการอาหาร
  // =====================================

  const handleSave = async () => {
    if (saving) return;

    if (!verified || !verifiedBooking) {
      setMessage("กรุณาตรวจสอบการจองก่อน");
      setMessageType("error");
      return;
    }

    if (verifiedBooking.nature_experience_selected) {
      return;
    }

    // ไม่เลือกรายการอาหาร = ไม่บันทึก
    // และไม่ส่งอีเมลแจ้งแอดมิน

    if (items.length === 0) {
      setMessage(
        "ยังไม่ได้เลือกรายการอาหาร หากต้องการสั่งอาหาร กรุณาเลือกเมนูที่ต้องการ"
      );

      setMessageType("error");
      return;
    }

    const customerEmail = email.trim().toLowerCase();

    if (!customerEmail) {
      setMessage("กรุณากรอกอีเมลที่ใช้จอง");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch(
        "/api/dinner-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "save",
            booking_code: verifiedBooking.booking_code,
            email: customerEmail,
            dinner_items: items,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "ไม่สามารถบันทึกรายการอาหารได้"
        );
      }

      setVerifiedBooking((current) =>
        current
          ? {
              ...current,
              dinner_items: items,
              dinner_total: total,
            }
          : current
      );

      setMessage(
        "บันทึกรายการอาหารเรียบร้อยแล้ว ค่าอาหารชำระแยกในวันเช็กอิน"
      );

      setMessageType("success");

    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "เกิดข้อผิดพลาดในการบันทึก"
      );

      setMessageType("error");

    } finally {
      setSaving(false);
    }
  };

  // =====================================
  // หน้าตรวจสอบ Booking
  // สำหรับการสั่งอาหารภายหลัง
  // =====================================

  if (!verified) {
    return (
      <section className="my-8 overflow-hidden rounded-2xl border border-amber-300 bg-amber-50 text-stone-900">

        <div className="bg-amber-900 px-6 py-5 text-white">

          <p className="text-xs font-bold tracking-widest text-amber-100">
            LAKLAI VIEW DINNER
          </p>

          <h2 className="mt-2 text-2xl font-extrabold">
            🍽️ สั่งอาหารเย็นล่วงหน้า
          </h2>

          <p className="mt-3 text-sm leading-7">
            กรุณากรอก Booking Code และอีเมลที่ใช้จอง
            เพื่อตรวจสอบการจองก่อนสั่งอาหาร
          </p>

        </div>

        <div className="space-y-5 p-5">

          <div>
            <label className="mb-2 block text-sm font-bold">
              Booking Code
            </label>

            <input
              type="text"
              value={bookingCode}
              onChange={(event) =>
                setBookingCode(event.target.value)
              }
              placeholder="ตัวอย่าง LKV-261112-1234"
              autoComplete="off"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base font-semibold text-stone-950 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              อีเมลที่ใช้จอง
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="กรอกอีเมลที่ใช้ในการจอง"
              autoComplete="email"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base font-semibold text-stone-950 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-200"
            />
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="w-full rounded-xl bg-green-700 px-5 py-4 text-lg font-extrabold text-white hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifying
              ? "กำลังตรวจสอบ..."
              : "ตรวจสอบการจอง"}
          </button>

          {message && (
            <p
              role="status"
              className={`rounded-xl border p-4 text-center text-sm font-bold leading-6 ${
                messageType === "success"
                  ? "border-green-300 bg-green-50 text-green-800"
                  : "border-red-300 bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

        </div>
      </section>
    );
  }

  // =====================================
  // Nature Experience
  // รวมอาหาร 3 มื้อ
  // =====================================

  if (verifiedBooking?.nature_experience_selected) {
    return (
      <section className="my-8 rounded-2xl border border-green-300 bg-green-50 p-6 text-stone-900">

        <h2 className="text-xl font-bold text-green-900">
          🌿 กิจกรรมวิถีบ้านป่า
        </h2>

        <p className="mt-3 text-sm font-medium leading-7 text-green-900">
          การจองนี้รวมอาหาร 3 มื้อในแพ็กเกจกิจกรรมแล้ว
          จึงไม่สามารถสั่งอาหารเย็นเพิ่มเติมผ่านระบบนี้ได้
        </p>

        <p className="mt-3 text-sm font-bold text-green-800">
          Booking Code: {verifiedBooking.booking_code}
        </p>

      </section>
    );
  }

  // =====================================
  // หน้าสั่งอาหาร
  // =====================================

  return (
    <section className="my-8 overflow-hidden rounded-2xl border border-amber-300 bg-amber-50 text-stone-900">

      {/* HEADER */}

      <div className="bg-amber-900 px-6 py-5 text-white">

        <p className="text-xs font-bold tracking-widest text-amber-100">
          LAKLAI VIEW DINNER
        </p>

        <h2 className="mt-2 text-2xl font-extrabold text-white">
          🍽️ สั่งอาหารเย็นล่วงหน้า
        </h2>

        <p className="mt-3 text-sm font-medium leading-7 text-white">
          กรุณาสั่งอาหารล่วงหน้าอย่างน้อย 1 วันก่อนเข้าพัก
          ค่าอาหารชำระแยกต่างหากในวันเช็กอิน
        </p>

        <p className="mt-1 text-sm font-medium text-amber-100">
          เวลาอาหารเย็น 17:30–18:45 น.
        </p>

      </div>

      <div className="space-y-6 p-5">

        {/* BOOKING INFORMATION */}

        <div className="rounded-xl border border-green-300 bg-green-50 p-4">

          <p className="font-bold text-green-900">
            ✓ ข้อมูลการจอง
          </p>

          <p className="mt-2 text-sm text-green-900">
            Booking Code: {verifiedBooking?.booking_code}
          </p>

          <p className="mt-1 text-sm text-green-900">
            วันเข้าพัก: {verifiedBooking?.check_in}
          </p>

          <p className="mt-1 text-sm text-green-900">
            อีเมล: {email}
          </p>

          <button
            type="button"
            onClick={() => {
              setVerified(false);
              setVerifiedBooking(null);
              setQuantities({});
              setMessage("");
              setMessageType("");
            }}
            className="mt-3 text-sm font-bold text-green-800 underline"
          >
            เปลี่ยนข้อมูลการจอง
          </button>

        </div>

        {/* MENU */}

        {Object.entries(groupedMenu).map(
          ([category, menu]) => {
            if (menu.length === 0) return null;

            return (
              <div key={category}>

                <h3 className="mb-3 border-b border-amber-300 pb-3 text-lg font-extrabold text-amber-950">
                  {category}
                </h3>

                <div className="space-y-3">

                  {menu.map((item) => {
                    const quantity =
                      quantities[item.id] ?? 0;

                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-3 rounded-xl border border-stone-300 bg-white p-4"
                      >

                        <div className="min-w-0">

                          <p className="text-base font-bold leading-6 text-stone-950">
                            {item.name}
                          </p>

                          <p className="mt-1 text-base font-bold text-amber-900">
                            ฿
                            {item.price.toLocaleString(
                              "th-TH"
                            )}
                          </p>

                        </div>

                        <div className="flex shrink-0 items-center gap-3">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                quantity - 1
                              )
                            }
                            disabled={quantity === 0}
                            aria-label={`ลด ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-400 bg-white text-xl font-bold text-stone-900 hover:bg-stone-100 disabled:cursor-not-allowed disabled:text-stone-400 disabled:opacity-70"
                          >
                            −
                          </button>

                          <span className="min-w-8 text-center text-xl font-extrabold text-stone-950">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                quantity + 1
                              )
                            }
                            disabled={quantity >= 20}
                            aria-label={`เพิ่ม ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-800 text-xl font-bold text-white hover:bg-amber-950 disabled:opacity-40"
                          >
                            +
                          </button>

                        </div>

                      </div>
                    );
                  })}

                </div>
              </div>
            );
          }
        )}

        {/* SUMMARY */}

        <div className="rounded-xl border border-amber-300 bg-white p-5">

          <h3 className="text-lg font-extrabold text-stone-950">
            สรุปรายการอาหาร
          </h3>

          {items.length === 0 ? (
            <p className="mt-3 text-sm font-medium text-stone-600">
              ยังไม่ได้เลือกรายการอาหาร
            </p>
          ) : (
            <div className="mt-3 space-y-3">

              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 border-b border-stone-200 pb-3 text-sm font-semibold text-stone-900"
                >

                  <span className="leading-6 text-stone-900">
                    {item.name} × {item.quantity}
                  </span>

                  <span className="whitespace-nowrap font-bold text-stone-950">
                    ฿
                    {(
                      item.price * item.quantity
                    ).toLocaleString("th-TH")}
                  </span>

                </div>
              ))}

            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-amber-300 pt-4">

            <span className="text-base font-extrabold text-stone-950">
              รวมค่าอาหาร
            </span>

            <span className="text-2xl font-extrabold text-amber-950">
              ฿{total.toLocaleString("th-TH")}
            </span>

          </div>

          <p className="mt-3 text-sm font-medium leading-7 text-stone-700">
            ค่าอาหารไม่รวมกับยอดค่าที่พักและยอดโอนเงิน
            ชำระค่าอาหารในวันเช็กอิน
          </p>

        </div>

        {/* SAVE BUTTON */}

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || items.length === 0}
          className="w-full rounded-xl bg-green-700 px-5 py-4 text-lg font-extrabold text-white shadow-sm hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving
            ? "กำลังบันทึก..."
            : "บันทึกรายการอาหาร"}
        </button>

        {/* MESSAGE */}

        {message && (
          <p
            role="status"
            className={`rounded-xl border p-4 text-center text-sm font-bold leading-6 ${
              messageType === "success"
                ? "border-green-300 bg-green-50 text-green-800"
                : "border-red-300 bg-red-50 text-red-700"
            }`}
          >
            {message}
          </p>
        )}

      </div>
    </section>
  );
}