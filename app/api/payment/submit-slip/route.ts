import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("========== SUBMIT SLIP ==========");
    console.log("BODY =", body);

    const {
      bookingCode,
      slipUrl,
    } = body;

    console.log("bookingCode =", bookingCode);
    console.log("slipUrl =", slipUrl);

    if (!bookingCode) {
      console.error("ERROR: ไม่มี bookingCode");

      return NextResponse.json(
        {
          error: "ไม่พบเลขที่การจอง",
          missing: "bookingCode",
        },
        {
          status: 400,
        }
      );
    }

    if (!slipUrl) {
      console.error("ERROR: ไม่มี slipUrl");

      return NextResponse.json(
        {
          error: "ไม่พบ URL ของสลิป",
          missing: "slipUrl",
        },
        {
          status: 400,
        }
      );
    }

    console.log("กำลังค้นหา Booking:", bookingCode);

    const {
      data: booking,
      error: findError,
    } = await supabase
      .from("bookings")
      .select("*")
      .eq("booking_code", bookingCode)
      .single();

    if (findError) {
      console.error(
        "BOOKING SEARCH ERROR =",
        findError
      );
    }

    if (!booking) {
      console.error(
        "ไม่พบ Booking:",
        bookingCode
      );

      return NextResponse.json(
        {
          error: "ไม่พบรายการจอง",
        },
        {
          status: 404,
        }
      );
    }

    console.log(
      "พบ Booking:",
      booking.booking_code
    );

    console.log(
      "สถานะเดิม:",
      booking.booking_status,
      booking.payment_status
    );

    if (booking.booking_status === "cancelled") {
      return NextResponse.json(
        {
          error: "รายการจองนี้ถูกยกเลิกแล้ว",
        },
        {
          status: 400,
        }
      );
    }

    if (booking.booking_status === "confirmed") {
      return NextResponse.json(
        {
          error: "รายการจองนี้ได้รับการยืนยันแล้ว",
        },
        {
          status: 400,
        }
      );
    }

    console.log(
      "กำลังบันทึก Slip URL ลงฐานข้อมูล..."
    );

    const {
      error: updateError,
    } = await supabase
      .from("bookings")
      .update({
        slip_url: slipUrl,
        payment_status: "waiting",
        booking_status: "pending",
      })
      .eq("id", booking.id);

    if (updateError) {
      console.error(
        "DATABASE UPDATE ERROR =",
        updateError
      );

      throw updateError;
    }

    console.log(
      "บันทึกสลิปสำเร็จ:",
      bookingCode
    );

    console.log(
      "================================"
    );

    return NextResponse.json({
      success: true,
      bookingCode: booking.booking_code,
    });

  } catch (error) {
    console.error(
      "SUBMIT SLIP ERROR =",
      error
    );

    return NextResponse.json(
      {
        error: "ไม่สามารถส่งสลิปได้",
      },
      {
        status: 500,
      }
    );
  }
}