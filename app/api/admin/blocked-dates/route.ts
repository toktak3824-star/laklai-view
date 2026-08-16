import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: Request) {
  try {
    const {
      roomId,
      blockedDate,
      reason,
    } = await req.json();

    console.log(
      "===== TOGGLE BLOCK DATE ====="
    );

    console.log("roomId =", roomId);
    console.log("blockedDate =", blockedDate);
    console.log("reason =", reason);

    if (!roomId || !blockedDate) {
      return NextResponse.json(
        {
          error:
            "ข้อมูลบ้านพักหรือวันที่ไม่ครบ",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================
    // 1. ตรวจว่ามี Booking ในวันนี้หรือไม่
    // =========================================

    const {
      data: bookings,
      error: bookingError,
    } = await supabaseAdmin
      .from("bookings")
      .select(
        `
        id,
        booking_code,
        room_id,
        check_in,
        check_out,
        booking_status
        `
      )
      .eq("room_id", roomId)
      .in("booking_status", [
        "pending",
        "confirmed",
      ])
      .lt(
        "check_in",
        blockedDate + "T23:59:59"
      )
      .gt(
        "check_out",
        blockedDate
      );

    if (bookingError) {
      console.error(
        "CHECK BOOKING ERROR =",
        bookingError
      );

      throw bookingError;
    }

    if (
      bookings &&
      bookings.length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "วันที่นี้มีการจองอยู่แล้ว ไม่สามารถปิดวันที่ได้",
          booking: bookings[0],
        },
        {
          status: 409,
        }
      );
    }

    // =========================================
    // 2. ตรวจว่ามีวันที่ถูกปิดอยู่แล้วหรือไม่
    // =========================================

    const {
      data: existing,
      error: existingError,
    } = await supabaseAdmin
      .from("blocked_dates")
      .select("*")
      .eq("room_id", roomId)
      .eq(
        "blocked_date",
        blockedDate
      )
      .maybeSingle();

    if (existingError) {
      console.error(
        "CHECK BLOCKED DATE ERROR =",
        existingError
      );

      throw existingError;
    }

    // =========================================
    // 3. ถ้ามีอยู่แล้ว → เปิดรับจอง
    // =========================================

    if (existing) {
      const {
        error: deleteError,
      } = await supabaseAdmin
        .from("blocked_dates")
        .delete()
        .eq(
          "id",
          existing.id
        );

      if (deleteError) {
        console.error(
          "UNBLOCK ERROR =",
          deleteError
        );

        throw deleteError;
      }

      console.log(
        "เปิดรับจองสำเร็จ =",
        blockedDate
      );

      return NextResponse.json({
        success: true,
        action: "unblocked",
        message:
          "เปิดรับจองวันที่นี้แล้ว",
      });
    }

    // =========================================
    // 4. ถ้ายังไม่มี → ปิดรับจอง
    // =========================================

    const {
      data,
      error: insertError,
    } = await supabaseAdmin
      .from("blocked_dates")
      .insert([
        {
          room_id: roomId,
          blocked_date: blockedDate,
          reason:
            reason ||
            "ปิดรับจองโดยผู้ดูแล",
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error(
        "INSERT BLOCKED DATE ERROR =",
        insertError
      );

      throw insertError;
    }

    console.log(
      "ปิดรับจองสำเร็จ =",
      data
    );

    return NextResponse.json({
      success: true,
      action: "blocked",
      data,
      message:
        "ปิดรับจองวันที่นี้แล้ว",
    });

  } catch (error) {
    console.error(
      "BLOCK DATE ERROR =",
      error
    );

    return NextResponse.json(
      {
        error:
          "ไม่สามารถเปลี่ยนสถานะวันที่ได้",
        detail: String(error),
      },
      {
        status: 500,
      }
    );
  }
}