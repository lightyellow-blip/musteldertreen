import prisma from "@/lib/shared/prisma";

export const PAGE_SIZE = 50;

export type ActivityRow = {
  id: string;
  adminId: string | null;
  adminEmail: string | null;
  adminName: string | null;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: unknown;
  createdAt: Date;
};

export type PersonalInfoRow = {
  id: string;
  adminId: string;
  adminName: string;
  resource: string;
  resourceId: string;
  action: string;
  ipAddress: string | null;
  createdAt: Date;
};

export type EmailRow = {
  id: string;
  toEmail: string;
  subject: string;
  type: string;
  status: string;
  sentByAdminId: string | null;
  sentByName: string | null;
  resourceId: string | null;
  resendId: string | null;
  errorMessage: string | null;
  createdAt: Date;
};

export type Page<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};

function clampPage(page: number | undefined): number {
  return Math.max(1, Math.floor(page ?? 1));
}

export async function getActivityLogs(page?: number): Promise<Page<ActivityRow>> {
  const p = clampPage(page);
  const [rows, total] = await Promise.all([
    prisma.adminActivityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (p - 1) * PAGE_SIZE,
    }),
    prisma.adminActivityLog.count(),
  ]);
  return { rows: rows as ActivityRow[], total, page: p, pageSize: PAGE_SIZE };
}

export async function getPersonalInfoLogs(page?: number): Promise<Page<PersonalInfoRow>> {
  const p = clampPage(page);
  const [rows, total] = await Promise.all([
    prisma.personalInfoAccessLog.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (p - 1) * PAGE_SIZE,
    }),
    prisma.personalInfoAccessLog.count(),
  ]);
  return { rows: rows as PersonalInfoRow[], total, page: p, pageSize: PAGE_SIZE };
}

export async function getEmailLogs(page?: number): Promise<Page<EmailRow>> {
  const p = clampPage(page);
  const [rows, total] = await Promise.all([
    prisma.emailSendLog.findMany({
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (p - 1) * PAGE_SIZE,
    }),
    prisma.emailSendLog.count(),
  ]);
  return { rows: rows as EmailRow[], total, page: p, pageSize: PAGE_SIZE };
}
