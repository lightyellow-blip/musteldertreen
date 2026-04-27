import { NextRequest, NextResponse } from "next/server";
import { login, setSessionCookie } from "@/lib/admin/auth";
import { logActivity } from "@/lib/admin/access-log";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "이메일과 비밀번호를 입력해주세요." },
        { status: 400 }
      );
    }

    const result = await login(email, password);

    if (!result.success) {
      await logActivity({
        action: "LOGIN_FAILED",
        adminEmail: email,
        metadata: { reason: result.error },
      });
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }

    // 세션 쿠키 설정
    await setSessionCookie(result.session!);

    await logActivity({
      action: "LOGIN",
      adminId: result.session!.id,
      adminEmail: result.session!.email,
      adminName: result.session!.name,
    });

    return NextResponse.json({
      success: true,
      admin: {
        id: result.session!.id,
        email: result.session!.email,
        name: result.session!.name,
        role: result.session!.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "로그인 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
