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

// 사이트 설정 가져오기
export async function getSiteSettings() {
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
