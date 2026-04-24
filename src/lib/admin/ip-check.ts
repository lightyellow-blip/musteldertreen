import { headers } from "next/headers";
import { prisma } from "@/lib/shared/prisma";

// 클라이언트 IP 가져오기
export async function getClientIp(): Promise<string> {
  const headersList = await headers();

  // Vercel, Cloudflare 등에서 전달하는 실제 클라이언트 IP
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for는 "client, proxy1, proxy2" 형식일 수 있음
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = headersList.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  // 로컬 개발 환경
  return "127.0.0.1";
}

// IP가 CIDR 범위에 포함되는지 체크
function ipInCidr(ip: string, cidr: string): boolean {
  // CIDR 형식이 아니면 정확히 일치하는지 체크
  if (!cidr.includes("/")) {
    return ip === cidr;
  }

  const [range, bits] = cidr.split("/");
  const mask = parseInt(bits, 10);

  // IPv4만 지원
  const ipParts = ip.split(".").map(Number);
  const rangeParts = range.split(".").map(Number);

  if (ipParts.length !== 4 || rangeParts.length !== 4) {
    return ip === range; // 형식이 맞지 않으면 정확히 일치하는지만 체크
  }

  const ipNum = (ipParts[0] << 24) + (ipParts[1] << 16) + (ipParts[2] << 8) + ipParts[3];
  const rangeNum = (rangeParts[0] << 24) + (rangeParts[1] << 16) + (rangeParts[2] << 8) + rangeParts[3];
  const maskNum = ~((1 << (32 - mask)) - 1);

  return (ipNum & maskNum) === (rangeNum & maskNum);
}

// IP 화이트리스트 체크
export async function checkIpWhitelist(): Promise<{ allowed: boolean; clientIp: string }> {
  const clientIp = await getClientIp();

  // 활성화된 IP 목록 가져오기
  const whitelist = await prisma.ipWhitelist.findMany({
    where: { isActive: true },
  });

  // 화이트리스트가 비어있으면 모든 IP 허용
  if (whitelist.length === 0) {
    return { allowed: true, clientIp };
  }

  // 로컬 IP는 항상 허용 (개발 환경)
  if (clientIp === "127.0.0.1" || clientIp === "::1" || clientIp === "localhost") {
    return { allowed: true, clientIp };
  }

  // 화이트리스트에서 IP 체크
  const isAllowed = whitelist.some((entry) => ipInCidr(clientIp, entry.ip));

  return { allowed: isAllowed, clientIp };
}
