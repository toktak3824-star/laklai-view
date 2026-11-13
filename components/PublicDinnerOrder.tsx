"use client";

import { useMemo, useState } from "react";
import { DINNER_MENU } from "@/data/dinnerMenu";

type DinnerItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type VerifiedBooking = {
  booking_code: string;
  guest_name: string;
  check_in: string;
  check_out: string;
  room_id: string;
  dinner_items: DinnerItem[];
  dinner_total: number;
  nature_experience_selected: boolean;
};

export default function DinnerOrder() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [verified, setVerified] = useState(false);
  const [booking, setBooking] =
    useState<VerifiedBooking | null>(null);

  const [quantities, setQuantities] =
    useState<Record<string, number>>({});

  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] =
    useState<"success" | "error" | "">("");

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
    (sum, item) => sum + item.price * item.quantity,
    0
  );

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

  const updateQuantity = (id: string, value: number) => {
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

  // ตรวจสอบการจองด้วย Email + Phone
  const handleVerify = async () => {
    if (verifying) return;

    const customerEmail = email.trim().toLowerCase();
    const customerPhone = phone.trim();

    if (!customerEmail || !customerPhone) {
      setMessage("กรุณากรอกอีเมลและเบอร์โทรศัพท์ที่ใช้จอง");
      setMessageType("error");
      return;
    }

    setVerifying(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("/api/dinner-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify",
          email: customerEmail,
          phone: customerPhone,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "ไม่สามารถตรวจสอบการจองได้"
        );
      }

      const isNature = Boolean(
        result.nature_experience_selected
      );

      const savedItems: DinnerItem[] =
        Array.isArray(result.dinner_items)
          ? result.dinner_items
          : [];

      const nextQuantities: Record<string, number> = {};

      for (const item of savedItems) {
        nextQuantities[item.id] = Number(item.quantity) || 0;
      }

      setQuantities(isNature ? {} : nextQuantities);

      setBooking({
        booking_code: result.booking_code ?? "",
        guest_name: result.guest_name ?? "",
        check_in: result.check_in ?? "",
        check_out: result.check_out ?? "",
        room_id: result.room_id ?? "",
        dinner_items: savedItems,
        dinner_total: Number(result.dinner_total ?? 0),
        nature_experience_selected: isNature,
      });

      setVerified(true);

      setMessage(
        result.message || "ตรวจสอบการจองเรียบร้อยแล้ว"
      );

      setMessageType("success");
    } catch (error) {
      setVerified(false);
      setBooking(null);

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

  // บันทึกรายการอาหาร
  const handleSave = async () => {
    if (saving || !booking) return;

    if (booking.nature_experience_selected) return;

    const customerEmail = email.trim().toLowerCase();
    const customerPhone = phone.trim();

    setSaving(true);
    setMessage("");
    setMessageType("");

    try {
      const response = await fetch("/api/dinner-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "save",
          email: customerEmail,
          phone: customerPhone,
          dinner_items: items,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "ไม่สามารถบันทึกรายการอาหารได้"
        );
      }

      setBooking((current) =>
        current
          ? {
              ...current,
              dinner_items: items,
              dinner_total: total,
            }
          : current
      );

      setMessage(
        items.length > 0
          ? "บันทึกรายการอาหารเรียบร้อยแล้ว ชำระค่าอาหารในวันเช็กอิน"
          : "บันทึกสถานะยังไม่สั่งอาหารเรียบร้อยแล้ว"
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

  // หน้าตรวจสอบการจอง
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
            กรุณากรอกอีเมลและเบอร์โทรศัพท์ที่ใช้จอง
            เพื่อตรวจสอบการจองก่อนสั่งอาหาร
          </p>
        </div>

        <div className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-sm font-bold">
              อีเมลที่ใช้จอง
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="กรอกอีเมลที่ใช้จอง"
              autoComplete="email"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none focus:border-amber-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold">
              เบอร์โทรศัพท์ที่ใช้จอง
            </label>

            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="กรอกเบอร์โทรศัพท์ที่ใช้จอง"
              autoComplete="tel"
              inputMode="tel"
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-950 outline-none focus:border-amber-700"
            />
          </div>

          <button
            type="button"
            onClick={handleVerify}
            disabled={verifying}
            className="w-full rounded-xl bg-green-700 px-5 py-4 text-lg font-extrabold text-white hover:bg-green-800 disabled:opacity-50"
          >
            {verifying ? "กำลังตรวจสอบ..." : "ตรวจสอบการจอง"}
          </button>

          {message && (
            <p
              role="status"
              className={`rounded-xl border p-4 text-center text-sm font-bold ${
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

  // กรณีจองแพ็กเกจกิจกรรมวิถีบ้านป่า
  if (booking?.nature_experience_selected) {
    return (
      <section className="my-8 rounded-2xl border border-green-300 bg-green-50 p-6 text-stone-900">
        <h2 className="text-xl font-bold text-green-900">
          🌿 กิจกรรมวิถีบ้านป่า
        </h2>

        <p className="mt-3 text-sm leading-7 text-green-900">
          การจองนี้รวมอาหาร 3 มื้อในแพ็กเกจกิจกรรมแล้ว
          จึงไม่สามารถสั่งอาหารเย็นเพิ่มเติมได้
        </p>
      </section>
    );
  }

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
          กรุณาสั่งอาหารล่วงหน้าอย่างน้อย 1 วันก่อนเข้าพัก
          ค่าอาหารชำระแยกต่างหากในวันเช็กอิน
        </p>

        <p className="mt-1 text-sm text-amber-100">
          เวลาอาหารเย็น 17:30–18:45 น.
        </p>
      </div>

      <div className="space-y-6 p-5">
        <div className="rounded-xl border border-green-300 bg-green-50 p-4">
          <p className="font-bold text-green-900">
            ✓ ตรวจสอบการจองเรียบร้อยแล้ว
          </p>

          <p className="mt-2 text-sm text-green-900">
            Booking Code: {booking?.booking_code}
          </p>

          <p className="mt-1 text-sm text-green-900">
            ชื่อผู้จอง: {booking?.guest_name}
          </p>

          <p className="mt-1 text-sm text-green-900">
            บ้านพัก: {booking?.room_id}
          </p>

          <p className="mt-1 text-sm text-green-900">
            วันเข้าพัก: {booking?.check_in}
          </p>

          <button
            type="button"
            onClick={() => {
              setVerified(false);
              setBooking(null);
              setQuantities({});
              setMessage("");
              setMessageType("");
            }}
            className="mt-3 text-sm font-bold text-green-800 underline"
          >
            เปลี่ยนข้อมูลการจอง
          </button>
        </div>

        {Object.entries(groupedMenu).map(([category, menu]) => {
          if (menu.length === 0) return null;

          return (
            <div key={category}>
              <h3 className="mb-3 border-b border-amber-300 pb-3 text-lg font-extrabold text-amber-950">
                {category}
              </h3>

              <div className="space-y-3">
                {menu.map((item) => {
                  const quantity = quantities[item.id] ?? 0;

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-stone-300 bg-white p-4"
                    >
                      <div className="min-w-0">
                        <p className="text-base font-bold text-stone-950">
                          {item.name}
                        </p>

                        <p className="mt-1 font-bold text-amber-900">
                          ฿{item.price.toLocaleString("th-TH")}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, quantity - 1)
                          }
                          disabled={quantity === 0}
                          aria-label={`ลด ${item.name}`}
                          className="flex h-10 w-10 items-center justify-center rounded-lg border border-stone-400 bg-white text-xl font-bold disabled:opacity-40"
                        >
                          −
                        </button>

                        <span className="min-w-8 text-center text-xl font-extrabold">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.id, quantity + 1)
                          }
                          disabled={quantity >= 20}
                          aria-label={`เพิ่ม ${item.name}`}
                          className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-800 text-xl font-bold text-white disabled:opacity-40"
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
        })}

        <div className="rounded-xl border border-amber-300 bg-white p-5">
          <h3 className="text-lg font-extrabold">
            สรุปรายการอาหาร
          </h3>

          {items.length === 0 ? (
            <p className="mt-3 text-sm text-stone-600">
              ยังไม่ได้เลือกรายการอาหาร
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between gap-3 border-b border-stone-200 pb-3 text-sm"
                >
                  <span>
                    {item.name} × {item.quantity}
                  </span>

                  <span className="whitespace-nowrap font-bold">
                    ฿{(item.price * item.quantity).toLocaleString("th-TH")}
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between border-t border-amber-300 pt-4">
            <span className="font-extrabold">รวมค่าอาหาร</span>

            <span className="text-2xl font-extrabold text-amber-950">
              ฿{total.toLocaleString("th-TH")}
            </span>
          </div>

          <p className="mt-3 text-sm leading-7 text-stone-700">
            ค่าอาหารไม่รวมกับยอดค่าที่พักและยอดโอนเงิน
            ชำระค่าอาหารในวันเช็กอิน
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full rounded-xl bg-green-700 px-5 py-4 text-lg font-extrabold text-white hover:bg-green-800 disabled:opacity-50"
        >
          {saving ? "กำลังบันทึก..." : "บันทึกรายการอาหาร"}
        </button>

        {message && (
          <p
            role="status"
            className={`rounded-xl border p-4 text-center text-sm font-bold ${
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