import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, isSuperAdmin } from "@/lib/auth";

type Props = {
  params: Promise<{ id: string }>;
};

// IP 수정
export async function PATCH(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { description, isActive } = body;

    const existing = await prisma.ipWhitelist.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "IP를 찾을 수 없습니다." }, { status: 404 });
    }

    const updated = await prisma.ipWhitelist.update({
      where: { id },
      data: {
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("IP 수정 오류:", error);
    return NextResponse.json({ error: "IP 수정에 실패했습니다." }, { status: 500 });
  }
}

// IP 삭제
export async function DELETE(request: Request, { params }: Props) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const { id } = await params;

    const existing = await prisma.ipWhitelist.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "IP를 찾을 수 없습니다." }, { status: 404 });
    }

    await prisma.ipWhitelist.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("IP 삭제 오류:", error);
    return NextResponse.json({ error: "IP 삭제에 실패했습니다." }, { status: 500 });
  }
}
