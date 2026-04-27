import { headers } from "next/headers";
import { prisma } from "@/lib/shared/prisma";

/**
 * Logging helpers for the admin access log feature.
 *
 * All writers are intentionally fire-and-forget and swallow errors —
 * a logging failure must never break the operation that triggered it.
 * Pair each call with `await` so the row is committed before response,
 * but rely on the internal try/catch to keep the parent flow safe.
 */

export type ActivityAction = "LOGIN" | "LOGOUT" | "LOGIN_FAILED";
export type EmailType = "INQUIRY_REPLY";
export type EmailStatus = "SENT" | "FAILED";
export type PersonalInfoResource = "inquiry";
export type PersonalInfoAction = "VIEW";

/** Extract the client IP from request headers (Vercel/Supabase proxy chain aware). */
export async function getClientIp(): Promise<string | null> {
  try {
    const h = await headers();
    const forwarded = h.get("x-forwarded-for");
    if (forwarded) {
      // x-forwarded-for can be a comma-separated chain; the first entry is the original client.
      return forwarded.split(",")[0]?.trim() || null;
    }
    return h.get("x-real-ip") ?? h.get("x-vercel-forwarded-for") ?? null;
  } catch {
    return null;
  }
}

export async function getUserAgent(): Promise<string | null> {
  try {
    const h = await headers();
    return h.get("user-agent");
  } catch {
    return null;
  }
}

export async function logActivity(params: {
  action: ActivityAction;
  adminId?: string | null;
  adminEmail?: string | null;
  adminName?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const [ipAddress, userAgent] = await Promise.all([getClientIp(), getUserAgent()]);
    await prisma.adminActivityLog.create({
      data: {
        action: params.action,
        adminId: params.adminId ?? null,
        adminEmail: params.adminEmail ?? null,
        adminName: params.adminName ?? null,
        ipAddress,
        userAgent,
        metadata: params.metadata ? (params.metadata as never) : undefined,
      },
    });
  } catch (err) {
    console.error("[access-log] logActivity failed", err);
  }
}

export async function logPersonalInfoAccess(params: {
  adminId: string;
  adminName: string;
  resource: PersonalInfoResource;
  resourceId: string;
  action?: PersonalInfoAction;
}): Promise<void> {
  try {
    const ipAddress = await getClientIp();
    await prisma.personalInfoAccessLog.create({
      data: {
        adminId: params.adminId,
        adminName: params.adminName,
        resource: params.resource,
        resourceId: params.resourceId,
        action: params.action ?? "VIEW",
        ipAddress,
      },
    });
  } catch (err) {
    console.error("[access-log] logPersonalInfoAccess failed", err);
  }
}

export async function logEmailSend(params: {
  toEmail: string;
  subject: string;
  type: EmailType;
  status: EmailStatus;
  sentByAdminId?: string | null;
  sentByName?: string | null;
  resourceId?: string | null;
  resendId?: string | null;
  errorMessage?: string | null;
}): Promise<void> {
  try {
    await prisma.emailSendLog.create({
      data: {
        toEmail: params.toEmail,
        subject: params.subject,
        type: params.type,
        status: params.status,
        sentByAdminId: params.sentByAdminId ?? null,
        sentByName: params.sentByName ?? null,
        resourceId: params.resourceId ?? null,
        resendId: params.resendId ?? null,
        errorMessage: params.errorMessage ?? null,
      },
    });
  } catch (err) {
    console.error("[access-log] logEmailSend failed", err);
  }
}
