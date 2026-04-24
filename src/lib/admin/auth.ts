import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/shared/prisma";
import bcrypt from "bcryptjs";

export type Permission = "menus" | "contents" | "inquiries" | "analytics" | "settings" | "admins";

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN";
  permissions: Permission[];
}

const SESSION_COOKIE_NAME = "admin_session";
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "must-elder-secret-key-change-in-production-2024"
);

// JWT 토큰 생성 (서명됨)
export async function createSessionToken(admin: AdminSession): Promise<string> {
  return await new SignJWT({ ...admin })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

// JWT 토큰 검증 및 파싱
export async function parseSessionToken(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as "SUPER_ADMIN" | "ADMIN",
      permissions: payload.permissions as Permission[],
    };
  } catch {
    return null;
  }
}

// 현재 세션 가져오기
export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  const session = await parseSessionToken(sessionCookie.value);

  if (!session) {
    return null;
  }

  // DB에서 관리자 유효성 확인
  const admin = await prisma.admin.findUnique({
    where: { id: session.id },
  });

  if (!admin || !admin.isActive) {
    return null;
  }

  return session;
}

// 로그인
export async function login(email: string, password: string): Promise<{ success: boolean; error?: string; session?: AdminSession }> {
  const admin = await prisma.admin.findUnique({
    where: { email },
  });

  if (!admin) {
    return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  if (!admin.isActive) {
    return { success: false, error: "비활성화된 계정입니다." };
  }

  const isValid = await bcrypt.compare(password, admin.password);

  if (!isValid) {
    return { success: false, error: "이메일 또는 비밀번호가 올바르지 않습니다." };
  }

  // 마지막 로그인 시간 업데이트
  await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  const session: AdminSession = {
    id: admin.id,
    email: admin.email,
    name: admin.name,
    role: admin.role as "SUPER_ADMIN" | "ADMIN",
    permissions: admin.permissions as Permission[],
  };

  return { success: true, session };
}

// 권한 체크
export function hasPermission(session: AdminSession | null, permission: Permission): boolean {
  if (!session) return false;
  if (session.role === "SUPER_ADMIN") return true;
  return session.permissions.includes(permission);
}

// 최고관리자 체크
export function isSuperAdmin(session: AdminSession | null): boolean {
  return session?.role === "SUPER_ADMIN";
}

// 세션 쿠키 설정
export async function setSessionCookie(session: AdminSession): Promise<void> {
  const cookieStore = await cookies();
  const token = await createSessionToken(session);

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24시간
    path: "/",
  });
}

// 세션 쿠키 삭제 (로그아웃)
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}
