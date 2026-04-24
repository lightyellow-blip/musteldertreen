import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/shared/prisma";
import { getSession, isSuperAdmin } from "@/lib/admin/auth";
import bcrypt from "bcryptjs";

// 관리자 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const { name, password, permissions, isActive } = await request.json();

    // 관리자 존재 확인
    const existing = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "관리자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 최고관리자는 수정 불가
    if (existing.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "최고관리자는 수정할 수 없습니다." },
        { status: 403 }
      );
    }

    const updateData: Record<string, unknown> = {};

    if (name !== undefined) updateData.name = name;
    if (permissions !== undefined) updateData.permissions = permissions;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const admin = await prisma.admin.update({
      where: { id },
      data: updateData,
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
    console.error("Update admin error:", error);
    return NextResponse.json(
      { success: false, error: "관리자 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 관리자 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!isSuperAdmin(session)) {
      return NextResponse.json(
        { success: false, error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const { id } = await params;

    // 관리자 존재 확인
    const existing = await prisma.admin.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "관리자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 최고관리자는 삭제 불가
    if (existing.role === "SUPER_ADMIN") {
      return NextResponse.json(
        { success: false, error: "최고관리자는 삭제할 수 없습니다." },
        { status: 403 }
      );
    }

    await prisma.admin.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete admin error:", error);
    return NextResponse.json(
      { success: false, error: "관리자 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
