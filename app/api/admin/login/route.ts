import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminCookieOptions,
  createAdminToken,
  getAdminCredentials,
} from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const username = String(body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (!username || !password) {
      return NextResponse.json(
        { error: "กรุณากรอก Username และ Password" },
        { status: 400 }
      );
    }

    const credentials = getAdminCredentials();

    if (
      username !== credentials.username ||
      password !== credentials.password
    ) {
      return NextResponse.json(
        { error: "Username หรือ Password ไม่ถูกต้อง" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "เข้าสู่ระบบผู้ดูแลระบบสำเร็จ",
    });

    response.cookies.set(
      ADMIN_COOKIE,
      createAdminToken(),
      adminCookieOptions
    );

    return response;
  } catch (error) {
    console.error("ADMIN LOGIN ERROR =", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "ไม่สามารถเข้าสู่ระบบได้",
      },
      { status: 500 }
    );
  }
}
