import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const bookingCode =
      searchParams.get("bookingCode")?.trim();

    if (!bookingCode) {
      return NextResponse.json(
        {
          error: "ไม่พบเลขที่การจอง",
        },
        {
          status: 400,
        }
      );
    }

    const { data: booking, error } =
      await supabaseAdmin
        .from("bookings")
        .select(
          `
          id,
          room_id,
          guest_name,
          phone,
          email,
          adults,
          children,
          child_ages,
          check_in,
          check_out,
          total_price,
          payment_status,
          booking_status,
          slip_url,
          note,
          created_at,
          booking_code,
          cancellation_reason
          `
        )
        .eq("booking_code", bookingCode)
        .single();

    if (error || !booking) {
      console.error(
        "GET BOOKING ERROR =",
        error
      );

      return NextResponse.json(
        {
          error: "ไม่พบข้อมูลการจอง",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error(
      "GET BOOKING SERVER ERROR =",
      error
    );

    return NextResponse.json(
      {
        error: "ไม่สามารถค้นหาข้อมูลการจองได้",
      },
      {
        status: 500,
      }
    );
  }
}