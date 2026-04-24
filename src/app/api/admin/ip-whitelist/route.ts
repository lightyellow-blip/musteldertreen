import { NextResponse } from "next/server";
import { prisma } from "@/lib/shared/prisma";
import { getSession, isSuperAdmin } from "@/lib/admin/auth";

// IP 목록 조회
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const ips = await prisma.ipWhitelist.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(ips);
  } catch (error) {
    console.error("IP 목록 조회 오류:", error);
    return NextResponse.json({ error: "IP 목록 조회에 실패했습니다." }, { status: 500 });
  }
}

// IP 추가
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  if (!isSuperAdmin(session)) {
    return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { ip, description } = body;

    if (!ip || typeof ip !== "string") {
      return NextResponse.json({ error: "IP 주소는 필수입니다." }, { status: 400 });
    }

    // IP 형식 검증 (IPv4, IPv6, CIDR 지원)
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)(?:\/(?:3[0-2]|[12]?\d))?$/;
    const ipv6Regex = /^(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}$/;

    if (!ipv4Regex.test(ip.trim()) && !ipv6Regex.test(ip.trim())) {
      return NextResponse.json({ error: "올바른 IP 주소 형식이 아닙니다." }, { status: 400 });
    }

    // 중복 체크
    const existing = await prisma.ipWhitelist.findUnique({
      where: { ip: ip.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "이미 등록된 IP 주소입니다." }, { status: 400 });
    }

    const newIp = await prisma.ipWhitelist.create({
      data: {
        ip: ip.trim(),
        description: description?.trim() || null,
      },
    });

    return NextResponse.json(newIp, { status: 201 });
  } catch (error) {
    console.error("IP 추가 오류:", error);
    return NextResponse.json({ error: "IP 추가에 실패했습니다." }, { status: 500 });
  }
}
