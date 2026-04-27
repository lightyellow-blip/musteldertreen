import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/shared/prisma";

/**
 * Daily cron-driven retention sweep — deletes access-log rows older than 1 year.
 *
 * Triggered by Vercel Cron (`vercel.json`). Vercel sends an
 * `Authorization: Bearer $CRON_SECRET` header which we verify before running,
 * so this endpoint cannot be invoked from outside even though it lives under
 * the admin API namespace.
 */

export const dynamic = "force-dynamic";

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }

  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - ONE_YEAR_MS);

  const [activity, personalInfo, email] = await Promise.all([
    prisma.adminActivityLog.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.personalInfoAccessLog.deleteMany({ where: { createdAt: { lt: cutoff } } }),
    prisma.emailSendLog.deleteMany({ where: { createdAt: { lt: cutoff } } }),
  ]);

  return NextResponse.json({
    success: true,
    cutoff: cutoff.toISOString(),
    deleted: {
      activity: activity.count,
      personalInfo: personalInfo.count,
      email: email.count,
    },
  });
}
