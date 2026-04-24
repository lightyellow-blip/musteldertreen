import { NextResponse } from "next/server";
import { prisma } from "@/lib/shared/prisma";
import { getSession, hasPermission } from "@/lib/admin/auth";

// 문의 상세 조회 (인증 필요)
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 인증 확인
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  // 권한 확인
  if (!hasPermission(session, "inquiries")) {
    return NextResponse.json(
      { error: "권한이 없습니다." },
      { status: 403 }
    );
  }

  const { id } = await params;

  const inquiry = await prisma.inquiry.findUnique({ where: { id } });

  if (!inquiry) {
    return NextResponse.json(
      { error: "문의를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: inquiry });
}

// 문의 상태 변경 (인증 필요)
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 인증 확인
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  // 권한 확인
  if (!hasPermission(session, "inquiries")) {
    return NextResponse.json(
      { error: "권한이 없습니다." },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  if (!["pending", "in_progress", "completed"].includes(status)) {
    return NextResponse.json(
      { error: "올바른 상태값이 아닙니다." },
      { status: 400 }
    );
  }

  const inquiry = await prisma.inquiry.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json({ data: inquiry });
}

// 문의 삭제 (인증 필요)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // 인증 확인
  const session = await getSession();
  if (!session) {
    return NextResponse.json(
      { error: "인증이 필요합니다." },
      { status: 401 }
    );
  }

  // 권한 확인
  if (!hasPermission(session, "inquiries")) {
    return NextResponse.json(
      { error: "권한이 없습니다." },
      { status: 403 }
    );
  }

  const { id } = await params;

  await prisma.inquiry.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
