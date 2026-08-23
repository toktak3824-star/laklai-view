import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

// =========================================
// วันที่ปัจจุบันตามเวลาไทย
// =========================================
function todayBangkok() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// =========================================
// แปลง timestamp ให้เป็นวันที่ประเทศไทย
// =========================================
function bangkokDate(value: string | null | undefined) {
  if (!value) return "";

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Bangkok",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

export async function GET() {
  // =========================================
  // ตรวจสอบสิทธิ์ Admin
  // =========================================
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { error: "ไม่มีสิทธิ์เข้าถึง" },
      { status: 401 }
    );
  }

  try {
    const today = todayBangkok();

    // =========================================
    // โหลดข้อมูล Booking + Coffee Order
    // =========================================
    const [
      {
        data: bookings,
        error: bookingsError,
      },
      {
        data: orders,
        error: ordersError,
      },
    ] = await Promise.all([
      supabaseAdmin
        .from("bookings")
        .select(
          `
          id,
          booking_status,
          payment_status,
          check_in,
          check_out,
          total_price,
          created_at,
          room_id
          `
        )
        .order("created_at", {
          ascending: false,
        }),

      supabaseAdmin
        .from("coffee_orders")
        .select(
          `
          id,
          order_status,
          payment_status,
          total_price,
          created_at
          `
        )
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (bookingsError) {
      throw bookingsError;
    }

    if (ordersError) {
      throw ordersError;
    }

    const bookingRows = bookings ?? [];
    const orderRows = orders ?? [];

    // =========================================
    // BOOKING STATUS
    // =========================================

    // ยืนยันแล้ว + ชำระเงินแล้ว
    const confirmedBookings = bookingRows.filter(
      (item) =>
        item.booking_status === "confirmed" &&
        item.payment_status === "paid"
    );

    // รอตรวจสอบ
    // ไม่นับรายการที่ยกเลิกแล้ว
    const pendingBookings = bookingRows.filter(
      (item) =>
        item.booking_status === "pending" &&
        item.booking_status !== "cancelled"
    );

    // ยกเลิก
    const cancelledBookings = bookingRows.filter(
      (item) =>
        item.booking_status === "cancelled"
    );

    // =========================================
    // COFFEE ORDER STATUS
    // =========================================

    // ชำระเงินแล้ว + ไม่ได้ยกเลิก
    const paidOrders = orderRows.filter(
      (item) =>
        item.payment_status === "paid" &&
        item.order_status !== "cancelled"
    );

    // รอตรวจสอบการชำระเงิน
    const pendingOrders = orderRows.filter(
      (item) =>
        item.payment_status === "submitted" ||
        item.payment_status === "waiting_verification"
    );

    // =========================================
    // CHECK-IN / CHECK-OUT วันนี้
    // =========================================

    const todayCheckIns = bookingRows.filter(
      (item) =>
        item.check_in === today &&
        item.booking_status !== "cancelled"
    ).length;

    const todayCheckOuts = bookingRows.filter(
      (item) =>
        item.check_out === today &&
        item.booking_status !== "cancelled"
    ).length;

    // =========================================
    // รายได้ที่พักสะสม
    // =========================================

    const bookingRevenue = confirmedBookings.reduce(
      (sum, item) =>
        sum + Number(item.total_price || 0),
      0
    );

    // =========================================
    // รายได้กาแฟสะสม
    // =========================================

    const coffeeRevenue = paidOrders.reduce(
      (sum, item) =>
        sum + Number(item.total_price || 0),
      0
    );

    // =========================================
    // รายได้ที่เกิดขึ้น "วันนี้"
    // ใช้เวลา Asia/Bangkok
    // =========================================

    const todayBookingRevenue = confirmedBookings
      .filter(
        (item) =>
          bangkokDate(item.created_at) === today
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.total_price || 0),
        0
      );

    const todayCoffeeRevenue = paidOrders
      .filter(
        (item) =>
          bangkokDate(item.created_at) === today
      )
      .reduce(
        (sum, item) =>
          sum + Number(item.total_price || 0),
        0
      );

    // =========================================
    // ส่งข้อมูล Dashboard
    // =========================================

    return NextResponse.json({
      today,

      stats: {
        // วันนี้
        todayCheckIns,
        todayCheckOuts,

        // รอจัดการ
        pendingBookings:
          pendingBookings.length,

        pendingOrders:
          pendingOrders.length,

        // Booking
        totalBookings:
          bookingRows.length,

        confirmedBookings:
          confirmedBookings.length,

        cancelledBookings:
          cancelledBookings.length,

        // Coffee
        totalOrders:
          orderRows.length,

        // รายได้
        bookingRevenue,
        coffeeRevenue,

        totalRevenue:
          bookingRevenue + coffeeRevenue,

        todayRevenue:
          todayBookingRevenue +
          todayCoffeeRevenue,
      },

      // ข้อมูลล่าสุด
      recentBookings:
        bookingRows.slice(0, 8),

      recentOrders:
        orderRows.slice(0, 8),
    });
  } catch (error) {
    console.error(
      "ADMIN SUMMARY ERROR =",
      error
    );

    return NextResponse.json(
      {
        error:
          "ไม่สามารถโหลดข้อมูล Dashboard ได้",
      },
      {
        status: 500,
      }
    );
  }
}