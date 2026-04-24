"use server";

import prisma from "@/lib/shared/prisma";
import { revalidatePath } from "next/cache";

export type InquiryStatus = "pending" | "in_progress" | "completed";

export interface Inquiry {
  id: string;
  status: InquiryStatus;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  fileUrl: string | null;
  fileName: string | null;
  // 답변 정보
  replySubject: string | null;
  replyMessage: string | null;
  repliedAt: Date | null;
  repliedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 문의 목록 조회
export async function getInquiries(status?: InquiryStatus): Promise<Inquiry[]> {
  const where = status ? { status } : {};
  const inquiries = await prisma.inquiry.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  return inquiries as Inquiry[];
}

// 문의 상세 조회
export async function getInquiry(id: string): Promise<Inquiry | null> {
  const inquiry = await prisma.inquiry.findUnique({
    where: { id },
  });
  return inquiry as Inquiry | null;
}

// 문의 상태 변경
export async function updateInquiryStatus(id: string, status: InquiryStatus) {
  await prisma.inquiry.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/inquiries");
  revalidatePath(`/admin/inquiries/${id}`);
}

// 문의 삭제
export async function deleteInquiry(id: string) {
  await prisma.inquiry.delete({
    where: { id },
  });
  revalidatePath("/admin/inquiries");
}

// 문의 통계
export async function getInquiryStats() {
  const [total, pending, inProgress, completed] = await Promise.all([
    prisma.inquiry.count(),
    prisma.inquiry.count({ where: { status: "pending" } }),
    prisma.inquiry.count({ where: { status: "in_progress" } }),
    prisma.inquiry.count({ where: { status: "completed" } }),
  ]);
  return { total, pending, inProgress, completed };
}
