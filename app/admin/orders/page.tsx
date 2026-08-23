"use client";

import { useEffect, useState } from "react";

type CoffeeOrder = {
  id: string;
  order_code: string;

  first_name: string;
  last_name: string;

  phone: string;
  email: string;

  address: string;
  subdistrict: string | null;
  district: string | null;
  province: string;
  postal_code: string;

  total_price: number;

  order_status: string | null;
  payment_status: string | null;

  slip_url: string | null;

  created_at: string;
};

export default function CoffeeOrdersAdminPage() {
  const [orders, setOrders] = useState<CoffeeOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedOrder, setSelectedOrder] =
    useState<CoffeeOrder | null>(null);
  
    const [slipImageUrl, setSlipImageUrl] =
  useState<string | null>(null);

    const [slipLoading, setSlipLoading] =
  useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);
  
  async function openSlip(order: CoffeeOrder) {
  setSelectedOrder(order);
  setSlipImageUrl(null);
  setSlipLoading(true);

  try {
    const response = await fetch(
  `/api/coffee-orders/slip?orderCode=${encodeURIComponent(
    order.order_code
  )}`,
  {
    method: "GET",
  }
);

const text = await response.text();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let data: any = {};

if (text) {
  try {
    data = JSON.parse(text);
  } catch {
    data = {};
  }
}

if (!response.ok) {
  throw new Error(
    data?.error ||
      "ไม่สามารถเปลี่ยนสถานะได้"
  );
}

    setSlipImageUrl(data.url);
  } catch (error) {
    console.error("OPEN SLIP ERROR =", error);

    alert(
      error instanceof Error
        ? error.message
        : "ไม่สามารถเปิดสลิปได้"
    );

    setSelectedOrder(null);
  } finally {
    setSlipLoading(false);
  }
}

  async function loadOrders() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "/api/coffee-orders",
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data?.error ||
            "โหลดรายการสั่งซื้อไม่สำเร็จ"
        );
      }

      setOrders(data.orders ?? []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาดในการโหลดรายการสั่งซื้อ"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
  loadOrders();
}, []);

  function formatPrice(value: number) {
    return `฿${Number(
      value || 0
    ).toLocaleString("th-TH")}`;
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString(
      "th-TH",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    );
  }

  function getOrderStatus(
    status: string | null
  ) {
    if (status === "pending") {
      return {
        text: "รอตรวจสอบ",
        className:
          "bg-amber-100 text-amber-900 border border-amber-300",
      };
    }

    if (status === "confirmed") {
      return {
        text: "ยืนยันแล้ว",
        className:
          "bg-green-100 text-green-900 border border-green-300",
      };
    }

    if (status === "cancelled") {
      return {
        text: "ยกเลิก",
        className:
          "bg-red-100 text-red-900 border border-red-300",
      };
    }

    return {
      text: status || "-",
      className:
        "bg-stone-100 text-stone-800 border border-stone-300",
    };
  }

  function getPaymentStatus(
    status: string | null
  ) {
    if (status === "waiting") {
      return {
        text: "รอชำระเงิน",
        className:
          "bg-orange-100 text-orange-900 border border-orange-300",
      };
    }

    if (
  status === "submitted" ||
  status === "waiting_verification"
) {
      return {
        text: "รอตรวจสอบสลิป",
        className:
          "bg-yellow-100 text-yellow-900 border border-yellow-300",
      };
    }

    if (status === "paid") {
      return {
        text: "ชำระแล้ว",
        className:
          "bg-green-100 text-green-900 border border-green-300",
      };
    }

    if (status === "rejected") {
      return {
        text: "สลิปไม่ผ่าน",
        className:
          "bg-red-100 text-red-900 border border-red-300",
      };
    }

    return {
      text: status || "-",
      className:
        "bg-stone-100 text-stone-800 border border-stone-300",
    };
  }

  async function updatePaymentStatus(
    order: CoffeeOrder,
    action:
      | "confirm"
      | "reject"
      | "cancel"
  ) {
    let message = "";

    if (action === "confirm") {
      message =
        `ยืนยันว่าได้รับเงินของ Order ${order.order_code} แล้วใช่หรือไม่?`;
    }

    if (action === "reject") {
      message =
        `ต้องการให้ลูกค้าส่งสลิปใหม่สำหรับ Order ${order.order_code} ใช่หรือไม่?`;
    }

    if (action === "cancel") {
      message =
        `ต้องการยกเลิก Order ${order.order_code} ใช่หรือไม่?`;
    }

    const confirmed =
      window.confirm(message);

    if (!confirmed) {
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch(
        "/api/coffee-orders",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            orderId: order.id,
            action,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "ไม่สามารถเปลี่ยนสถานะได้"
        );
      }

      alert(
        action === "confirm"
          ? "ยืนยันการรับเงินเรียบร้อยแล้ว\nระบบกำลังส่งอีเมลให้ลูกค้า"
          : action === "reject"
          ? "แจ้งให้ลูกค้าส่งสลิปใหม่เรียบร้อยแล้ว"
          : "ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว"
      );

      setSelectedOrder(null);

      await loadOrders();
    } catch (err) {
      console.error(
        "UPDATE COFFEE ORDER ERROR =",
        err
      );

      alert(
        err instanceof Error
          ? err.message
          : "เกิดข้อผิดพลาด กรุณาลองใหม่"
      );
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-100">

      {/* HEADER */}
      <div className="mb-8">

        <p className="text-sm font-semibold tracking-[0.35em] text-emerald-800">
          LAKLAI VIEW COFFEE
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-4">

          <div>

            <h1 className="text-4xl font-bold text-stone-950">
              รายการสั่งซื้อ
            </h1>

            <p className="mt-2 text-base font-medium text-stone-700">
              รายการสั่งกาแฟจากลูกค้าทั้งหมด
            </p>

          </div>

          <button
            onClick={loadOrders}
            className="rounded-xl bg-green-900 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-green-800"
          >
            รีเฟรช
          </button>

        </div>

      </div>


      {/* LOADING */}
      {loading && (
        <div className="rounded-2xl bg-white p-8 text-stone-800 shadow">
          กำลังโหลดรายการสั่งซื้อ...
        </div>
      )}


      {/* ERROR */}
      {!loading && error && (
        <div className="rounded-2xl border border-red-300 bg-red-50 p-6 text-red-900">

          <p className="font-semibold">
            เกิดข้อผิดพลาด
          </p>

          <p className="mt-1">
            {error}
          </p>

        </div>
      )}


      {/* EMPTY */}
      {!loading &&
        !error &&
        orders.length === 0 && (
          <div className="rounded-2xl bg-white p-10 text-center shadow">

            <h2 className="text-xl font-bold text-stone-950">
              ยังไม่มีรายการสั่งซื้อ
            </h2>

            <p className="mt-2 font-medium text-stone-600">
              เมื่อมีลูกค้าสั่งกาแฟ
              รายการจะปรากฏที่หน้านี้
            </p>

          </div>
        )}


      {/* ORDERS TABLE */}
      {!loading &&
        !error &&
        orders.length > 0 && (

          <div className="overflow-hidden rounded-2xl bg-white shadow">

            <div className="overflow-x-auto">

              <table className="min-w-full">

                <thead className="bg-stone-100">

                  <tr className="text-left text-sm font-bold text-stone-800">

                    <th className="px-6 py-4">
                      เลขคำสั่งซื้อ
                    </th>

                    <th className="px-6 py-4">
                      ลูกค้า
                    </th>

                    <th className="px-6 py-4">
                      โทรศัพท์
                    </th>

                    <th className="px-6 py-4">
                      ยอดรวม
                    </th>

                    <th className="px-6 py-4">
                      สถานะ
                    </th>

                    <th className="px-6 py-4">
                      วันที่
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {orders.map((order) => {

                    const orderStatus =
                      getOrderStatus(
                        order.order_status
                      );

                    const paymentStatus =
                      getPaymentStatus(
                        order.payment_status
                      );

                    return (

                      <tr
                        key={order.id}
                        className="border-t border-stone-200 transition hover:bg-stone-50"
                      >

                        {/* ORDER CODE */}
                        <td className="px-6 py-5">

                          <div className="font-bold text-emerald-800">
                            {order.order_code}
                          </div>

                        </td>


                        {/* CUSTOMER */}
                        <td className="px-6 py-5">

                          <div className="font-bold text-stone-950">
                            {order.first_name}{" "}
                            {order.last_name}
                          </div>

                          <div className="mt-1 text-sm font-medium text-stone-600">
                            {order.email}
                          </div>

                        </td>


                        {/* PHONE */}
                        <td className="px-6 py-5">

                          <span className="font-semibold text-stone-800">
                            {order.phone}
                          </span>

                        </td>


                        {/* PRICE */}
                        <td className="px-6 py-5">

                          <span className="text-lg font-bold text-stone-950">
                            {formatPrice(
                              order.total_price
                            )}
                          </span>

                        </td>


                        {/* STATUS */}
                        <td className="px-6 py-5">

                          <div className="flex flex-col gap-3">

                            {/* ORDER STATUS */}

                            <div>

                              <span className="mb-1 block text-xs font-semibold text-stone-600">
                                คำสั่งซื้อ
                              </span>

                              <span
                                className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold ${orderStatus.className}`}
                              >
                                {orderStatus.text}
                              </span>

                            </div>


                            {/* PAYMENT STATUS */}

                            <div>

                              <span className="mb-1 block text-xs font-semibold text-stone-600">
                                การชำระเงิน
                              </span>

                              <span
                                className={`inline-flex rounded-lg px-3 py-1 text-xs font-bold ${paymentStatus.className}`}
                              >
                                {paymentStatus.text}
                              </span>

                            </div>


                            {/* VIEW SLIP */}

                            {order.slip_url && (

                              <button
                                type="button"
                                onClick={() => openSlip(order)}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                              >
                                👁 ดูสลิป
                              </button>

                            )}


                            {/* ACTIONS */}

                            {(
  order.payment_status === "submitted" ||
  order.payment_status === "waiting_verification"
) && (

                              <div className="flex flex-col gap-2">

                                <button
                                  type="button"
                                  disabled={
                                    actionLoading
                                  }
                                  onClick={() =>
                                    updatePaymentStatus(
                                      order,
                                      "confirm"
                                    )
                                  }
                                  className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-800 disabled:opacity-50"
                                >
                                  ✓ ยืนยันการรับเงิน
                                </button>


                                <button
                                  type="button"
                                  disabled={
                                    actionLoading
                                  }
                                  onClick={() =>
                                    updatePaymentStatus(
                                      order,
                                      "reject"
                                    )
                                  }
                                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-orange-600 disabled:opacity-50"
                                >
                                  ↻ ให้ส่งสลิปใหม่
                                </button>

                              </div>

                            )}


                            {/* CANCEL */}

                            {order.order_status !==
                              "cancelled" &&
                              order.payment_status !==
                                "paid" && (

                              <button
                                type="button"
                                disabled={
                                  actionLoading
                                }
                                onClick={() =>
                                  updatePaymentStatus(
                                    order,
                                    "cancel"
                                  )
                                }
                                className="rounded-lg border border-red-300 bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                              >
                                ยกเลิกคำสั่งซื้อ
                              </button>

                            )}

                          </div>

                        </td>


                        {/* DATE */}

                        <td className="whitespace-nowrap px-6 py-5">

                          <span className="text-sm font-semibold text-stone-700">
                            {formatDate(
                              order.created_at
                            )}
                          </span>

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          </div>

        )}


      {/* SLIP MODAL */}

{selectedOrder && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5"
    onClick={() => {
      setSelectedOrder(null);
      setSlipImageUrl("");
      setSlipLoading(false);
    }}
  >
    <div
      className="max-h-[95vh] w-full max-w-3xl overflow-auto rounded-3xl bg-white p-6 shadow-2xl"
      onClick={(event) => event.stopPropagation()}
    >

      {/* HEADER */}
      <div className="flex items-center justify-between gap-4">

        <div>
          <p className="text-sm font-semibold tracking-wider text-emerald-700">
            PAYMENT SLIP
          </p>

          <h2 className="mt-1 text-2xl font-bold text-stone-950">
            {selectedOrder.order_code}
          </h2>

          <p className="mt-1 text-stone-600">
            {selectedOrder.first_name}{" "}
            {selectedOrder.last_name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedOrder(null);
            setSlipImageUrl("");
            setSlipLoading(false);
          }}
          className="rounded-full bg-stone-100 px-4 py-2 font-bold text-stone-700 hover:bg-stone-200"
        >
          ✕
        </button>

      </div>


      {/* SLIP IMAGE */}
      {slipLoading ? (

        <div className="mt-6 rounded-2xl bg-stone-100 p-10 text-center text-stone-600">
          กำลังเปิดสลิป...
        </div>

      ) : slipImageUrl ? (

        <div className="mt-6 overflow-hidden rounded-2xl bg-stone-100 p-3">

          <img
            src={slipImageUrl}
            alt={`สลิป ${selectedOrder.order_code}`}
            className="mx-auto max-h-[70vh] max-w-full rounded-xl object-contain"
          />

        </div>

      ) : (

        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center text-amber-800">
          ไม่พบรูปสลิปของคำสั่งซื้อนี้
        </div>

      )}


      {/* ORDER INFORMATION */}
      <div className="mt-6 grid gap-3 rounded-2xl bg-stone-50 p-5 sm:grid-cols-2">

        <div>
          <p className="text-xs font-semibold text-stone-500">
            ลูกค้า
          </p>

          <p className="mt-1 font-semibold text-stone-900">
            {selectedOrder.first_name}{" "}
            {selectedOrder.last_name}
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold text-stone-500">
            ยอดชำระ
          </p>

          <p className="mt-1 text-lg font-bold text-emerald-700">
            ฿
            {Number(
              selectedOrder.total_price || 0
            ).toLocaleString("th-TH")}
          </p>
        </div>

      </div>


      {/* ACTION BUTTONS */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">

        {/* CONFIRM PAYMENT */}
        <button
          type="button"
          
              disabled={
  actionLoading ||
  ![
    "waiting",
    "submitted",
    "waiting_verification",
  ].includes(selectedOrder.payment_status ?? "")
}
          onClick={() =>
            updatePaymentStatus(
              selectedOrder,
              "confirm"
            )
          }
          className="rounded-xl bg-emerald-700 px-5 py-3 font-bold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {actionLoading
            ? "กำลังดำเนินการ..."
            : "✓ ยืนยันการรับเงิน"}
        </button>


        {/* REQUEST NEW SLIP */}
        <button
          type="button"
          disabled={actionLoading}
          onClick={() =>
            updatePaymentStatus(
              selectedOrder,
              "reject"
            )
          }
          className="rounded-xl bg-orange-300 px-5 py-3 font-bold text-orange-950 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ↻ ให้ลูกค้าส่งสลิปใหม่
        </button>

      </div>

    </div>
  </div>
)}

    </main>
  );
}