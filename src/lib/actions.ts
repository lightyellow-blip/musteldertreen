"use server";

import prisma from "@/lib/prisma";

// 메뉴 가져오기 (활성화된 것만)
export async function getActiveMenus() {
  const menus = await prisma.menu.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { order: "asc" },
    include: {
      children: {
        where: { isActive: true },
        orderBy: { order: "asc" },
      },
    },
  });
  return menus;
}

// DB 미접속 환경(빌드 CI / 일시 장애)에서 반환할 기본 설정.
// Settings 모델 전 필드를 schema 기본값(빈 문자열)으로 채워 타입 호환 유지.
const fallbackSiteSettings = {
  id: "site",
  siteName: "머스트 엘더트리엔",
  siteDescription: "디지털 혁신을 이끄는 IT 솔루션 파트너",
  logoUrl: "",
  faviconUrl: "",
  footerText: "",
  address: "",
  phone: "",
  email: "",
  businessHours: "",
  instagram: "",
  facebook: "",
  youtube: "",
  blog: "",
  metaTitle: "",
  metaDescription: "",
  metaKeywords: "",
  googleAnalyticsId: "",
  createdAt: new Date(0),
  updatedAt: new Date(0),
};

// 사이트 설정 가져오기
export async function getSiteSettings() {
  // Next.js 빌드 단계에서는 DB 접근 없이 기본값 반환. Next가 next build 중에
  // NEXT_PHASE=phase-production-build로 세팅하는 것을 이용 (DATABASE_URL
  // 유무보다 확실한 빌드 단계 감지 방법).
  if (
    process.env.NEXT_PHASE === "phase-production-build" ||
    !process.env.DATABASE_URL
  ) {
    return fallbackSiteSettings;
  }

  try {
    let settings = await prisma.settings.findUnique({
      where: { id: "site" },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: "site",
          siteName: "머스트 엘더트리엔",
          siteDescription: "디지털 혁신을 이끄는 IT 솔루션 파트너",
        },
      });
    }

    return settings;
  } catch {
    return fallbackSiteSettings;
  }
}

// 특정 메뉴의 콘텐츠 가져오기
export async function getMenuContents(href: string) {
  const menu = await prisma.menu.findFirst({
    where: { href, isActive: true },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          contents: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
  return menu;
}

// 홈페이지 콘텐츠 가져오기
export async function getHomeContents() {
  return getMenuContents("/");
}

// 문의 등록
export async function submitInquiry(data: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}) {
  const inquiry = await prisma.inquiry.create({
    data: {
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      subject: data.subject || null,
      message: data.message,
      status: "pending",
    },
  });
  return { success: true, id: inquiry.id };
}
