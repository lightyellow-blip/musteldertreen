import { NextResponse } from "next/server";
import { clearSessionCookie, getSession } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/access-log";

export async function POST() {
  try {
    // Capture session before clearing the cookie so we can attribute the logout.
    const session = await getSession();
    await clearSessionCookie();

    if (session) {
      await logActivity({
        action: "LOGOUT",
        adminId: session.id,
        adminEmail: session.email,
        adminName: session.name,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      { success: false, error: "로그아웃 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
