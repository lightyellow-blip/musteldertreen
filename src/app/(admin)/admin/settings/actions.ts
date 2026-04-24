"use server";

import prisma from "@/lib/shared/prisma";
import { revalidatePath } from "next/cache";

// 타입 정의
export interface Settings {
  id: string;
  siteName: string;
  siteDescription: string;
  logoUrl: string;
  faviconUrl: string;
  footerText: string;
  address: string;
  phone: string;
  email: string;
  businessHours: string;
  instagram: string;
  facebook: string;
  youtube: string;
  blog: string;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  googleAnalyticsId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 기본 설정값
const defaultSettings = {
  siteName: "머스트 엘더트리엔",
  siteDescription: "디지털 혁신을 이끄는 IT 솔루션 파트너",
  logoUrl: "/logo.png",
  faviconUrl: "/favicon.ico",
  footerText: "© 2024 머스트 엘더트리엔. All rights reserved.",
  address: "서울특별시 강남구 테헤란로 123, 10층",
  phone: "02-1234-5678",
  email: "contact@eldertrien.com",
  businessHours: "평일 09:00 - 18:00",
  instagram: "https://instagram.com/eldertrien",
  facebook: "",
  youtube: "",
  blog: "https://blog.naver.com/eldertrien",
  metaTitle: "머스트 엘더트리엔 | IT 솔루션 전문 기업",
  metaDescription:
    "UX/UI 디자인, 웹/앱 개발 전문 기업 머스트 엘더트리엔입니다.",
  metaKeywords: "IT솔루션, 웹개발, 앱개발, UX디자인, UI디자인",
  googleAnalyticsId: "",
};

// 설정 가져오기 (없으면 생성)
export async function getSettings(): Promise<Settings> {
  let settings = await prisma.settings.findUnique({
    where: { id: "site" },
  });

  if (!settings) {
    settings = await prisma.settings.create({
      data: {
        id: "site",
        ...defaultSettings,
      },
    });
  }

  return settings;
}

// 설정 업데이트
export async function updateSettings(
  data: Partial<Omit<Settings, "id" | "createdAt" | "updatedAt">>
) {
  const settings = await prisma.settings.upsert({
    where: { id: "site" },
    update: data,
    create: {
      id: "site",
      ...defaultSettings,
      ...data,
    },
  });

  revalidatePath("/admin/settings");
  return settings;
}
