import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, setSessionCookie } from "@/lib/auth";
import bcrypt from "bcryptjs";

// 내 정보 수정
export async function PATCH(request: NextRequest) {
  try {
    // 인증 확인
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { name, currentPassword, newPassword } = await request.json();

    // 이름 필수 검증
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "이름을 입력해주세요." },
        { status: 400 }
      );
    }

    // 이름 길이 검증
    if (name.trim().length > 50) {
      return NextResponse.json(
        { error: "이름은 50자 이내로 입력해주세요." },
        { status: 400 }
      );
    }

    // 현재 관리자 정보 조회
    const admin = await prisma.admin.findUnique({
      where: { id: session.id },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "관리자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 업데이트할 데이터
    const updateData: { name: string; password?: string } = {
      name: name.trim(),
    };

    // 비밀번호 변경 요청인 경우
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "현재 비밀번호를 입력해주세요." },
          { status: 400 }
        );
      }

      // 비밀번호 길이 검증
      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "새 비밀번호는 6자 이상이어야 합니다." },
          { status: 400 }
        );
      }

      // 현재 비밀번호 확인
      const isValidPassword = await bcrypt.compare(currentPassword, admin.password);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "현재 비밀번호가 올바르지 않습니다." },
          { status: 400 }
        );
      }

      // 새 비밀번호 해시
      updateData.password = await bcrypt.hash(newPassword, 12);
    }

    // 업데이트
    const updatedAdmin = await prisma.admin.update({
      where: { id: session.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
      },
    });

    // 세션 쿠키 갱신 (이름이 변경되었을 수 있으므로)
    await setSessionCookie({
      id: updatedAdmin.id,
      email: updatedAdmin.email,
      name: updatedAdmin.name,
      role: updatedAdmin.role as "SUPER_ADMIN" | "ADMIN",
      permissions: updatedAdmin.permissions as ("menus" | "contents" | "inquiries" | "analytics" | "settings" | "admins")[],
    });

    return NextResponse.json({
      success: true,
      admin: updatedAdmin,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "정보 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
