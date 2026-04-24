import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/shared/prisma";
import { getSession, isSuperAdmin } from "@/lib/admin/auth";
import bcrypt from "bcryptjs";

// 관리자 목록 조회
export async function GET() {
  try {
    const session = await getSession();

    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: [
        { role: "asc" }, // SUPER_ADMIN이 먼저
        { createdAt: "desc" },
      ],
    });

    return NextResponse.json({ success: true, admins });
  } catch (error) {
    console.error("Get admins error:", error);
    return NextResponse.json(
      { success: false, error: "관리자 목록 조회 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 관리자 생성
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const { email, password, name, permissions } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: "필수 정보를 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    const existing = await prisma.admin.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const admin = await prisma.admin.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: "ADMIN",
        permissions: permissions || [],
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        permissions: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, admin });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json(
      { success: false, error: "관리자 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
