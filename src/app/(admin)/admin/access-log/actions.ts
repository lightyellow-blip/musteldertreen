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

export type AllRow = {
  id: string;
  kind: "activity" | "personal-info" | "email";
  createdAt: Date;
  action: string; // activity.action / personal.action / email.status
  adminName: string | null;
  detail: string; // human-readable summary unique to each kind
  ipAddress: string | null;
  resourceId: string | null; // for linking when applicable
};

export type Page<T> = {
  rows: T[];
  total: number;
  page: number;
  pageSize: number;
};

export type DateRange = {
  from?: Date;
  to?: Date;
};

function clampPage(page: number | undefined): number {
  return Math.max(1, Math.floor(page ?? 1));
}

function buildDateWhere(range: DateRange) {
  if (!range.from && !range.to) return {};
  return {
    createdAt: {
      ...(range.from && { gte: range.from }),
      ...(range.to && { lte: range.to }),
    },
  };
}

export async function getActivityLogs(page?: number, range: DateRange = {}): Promise<Page<ActivityRow>> {
  const p = clampPage(page);
  const where = buildDateWhere(range);
  const [rows, total] = await Promise.all([
    prisma.adminActivityLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (p - 1) * PAGE_SIZE,
    }),
    prisma.adminActivityLog.count({ where }),
  ]);
  return { rows: rows as ActivityRow[], total, page: p, pageSize: PAGE_SIZE };
}

export async function getPersonalInfoLogs(page?: number, range: DateRange = {}): Promise<Page<PersonalInfoRow>> {
  const p = clampPage(page);
  const where = buildDateWhere(range);
  const [rows, total] = await Promise.all([
    prisma.personalInfoAccessLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (p - 1) * PAGE_SIZE,
    }),
    prisma.personalInfoAccessLog.count({ where }),
  ]);
  return { rows: rows as PersonalInfoRow[], total, page: p, pageSize: PAGE_SIZE };
}

export async function getEmailLogs(page?: number, range: DateRange = {}): Promise<Page<EmailRow>> {
  const p = clampPage(page);
  const where = buildDateWhere(range);
  const [rows, total] = await Promise.all([
    prisma.emailSendLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: PAGE_SIZE,
      skip: (p - 1) * PAGE_SIZE,
    }),
    prisma.emailSendLog.count({ where }),
  ]);
  return { rows: rows as EmailRow[], total, page: p, pageSize: PAGE_SIZE };
}

/**
 * Combines all 3 log streams into a single chronologically-ordered list.
 * Pagination happens in JS after merging — fine up to ~tens of thousands of
 * rows per date window. With 1-year retention and modest activity that's
 * comfortably within bounds; revisit with raw SQL UNION if it ever stops being.
 */
export async function getAllLogs(page?: number, range: DateRange = {}): Promise<Page<AllRow>> {
  const p = clampPage(page);
  const where = buildDateWhere(range);

  const [activity, personal, email] = await Promise.all([
    prisma.adminActivityLog.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.personalInfoAccessLog.findMany({ where, orderBy: { createdAt: "desc" } }),
    prisma.emailSendLog.findMany({ where, orderBy: { createdAt: "desc" } }),
  ]);

  const merged: AllRow[] = [
    ...activity.map((r) => ({
      id: r.id,
      kind: "activity" as const,
      createdAt: r.createdAt,
      action: r.action,
      adminName: r.adminName ?? r.adminEmail,
      detail: r.adminEmail ?? "",
      ipAddress: r.ipAddress,
      resourceId: null,
    })),
    ...personal.map((r) => ({
      id: r.id,
      kind: "personal-info" as const,
      createdAt: r.createdAt,
      action: r.action,
      adminName: r.adminName,
      detail: `${r.resource} / ${r.resourceId.slice(0, 8)}`,
      ipAddress: r.ipAddress,
      resourceId: r.resourceId,
    })),
    ...email.map((r) => ({
      id: r.id,
      kind: "email" as const,
      createdAt: r.createdAt,
      action: r.status,
      adminName: r.sentByName,
      detail: `${r.toEmail} — ${r.subject}`,
      ipAddress: null,
      resourceId: r.resourceId,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const total = merged.length;
  const start = (p - 1) * PAGE_SIZE;
  return { rows: merged.slice(start, start + PAGE_SIZE), total, page: p, pageSize: PAGE_SIZE };
}
