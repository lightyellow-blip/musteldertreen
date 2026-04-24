"use server";

import prisma from "@/lib/shared/prisma";

// 대시보드용 문의 통계
export async function getDashboardStats() {
  const [total, pending, inProgress, completed] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "pending" } }),
    prisma.inquiry.count({ where: { status: "in_progress" } }),
    prisma.inquiry.count({ where: { status: "completed" } }),
  ]);
  return { total, pending, in_progress: inProgress, completed };
}

// 최근 문의 5개
export async function getRecentInquiries() {
  return prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

// 대기 중 문의 5개
export async function getPendingInquiries() {
  return prisma.inquiry.findMany({
    where: { status: "pending" },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}
