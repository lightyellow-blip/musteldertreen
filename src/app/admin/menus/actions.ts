"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// 타입 정의
export interface Menu {
  id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  parentId: string | null;
  children?: Menu[];
  createdAt: Date;
  updatedAt: Date;
}

// 모든 메뉴 가져오기 (트리 구조)
export async function getMenus(): Promise<Menu[]> {
  const menus = await prisma.menu.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      children: {
        orderBy: { order: "asc" },
      },
    },
  });
  return menus;
}

// 메뉴 생성
export async function createMenu(data: {
  label: string;
  href: string;
  parentId?: string;
}) {
  // 같은 레벨의 최대 order 값 찾기
  const maxOrder = await prisma.menu.aggregate({
    where: { parentId: data.parentId || null },
    _max: { order: true },
  });

  const menu = await prisma.menu.create({
    data: {
      label: data.label,
      href: data.href,
      parentId: data.parentId || null,
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath("/admin/menus");
  return menu;
}

// 메뉴 수정
export async function updateMenu(
  id: string,
  data: { label?: string; href?: string }
) {
  const menu = await prisma.menu.update({
    where: { id },
    data,
  });

  revalidatePath("/admin/menus");
  return menu;
}

// 메뉴 삭제
export async function deleteMenu(id: string) {
  await prisma.menu.delete({
    where: { id },
  });

  revalidatePath("/admin/menus");
}

// 메뉴 활성화 토글
export async function toggleMenuActive(id: string, isActive: boolean) {
  const menu = await prisma.menu.update({
    where: { id },
    data: { isActive },
  });

  revalidatePath("/admin/menus");
  return menu;
}

// 메뉴 순서 변경
export async function reorderMenus(
  menuId: string,
  direction: "up" | "down",
  parentId: string | null
) {
  const menus = await prisma.menu.findMany({
    where: { parentId },
    orderBy: { order: "asc" },
  });

  const currentIndex = menus.findIndex((m) => m.id === menuId);
  if (currentIndex === -1) return;

  const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
  if (swapIndex < 0 || swapIndex >= menus.length) return;

  const currentMenu = menus[currentIndex];
  const swapMenu = menus[swapIndex];

  // 순서 스왑
  await prisma.$transaction([
    prisma.menu.update({
      where: { id: currentMenu.id },
      data: { order: swapMenu.order },
    }),
    prisma.menu.update({
      where: { id: swapMenu.id },
      data: { order: currentMenu.order },
    }),
  ]);

  revalidatePath("/admin/menus");
}

// 초기 데이터 시드 (빈 테이블일 때 사용)
export async function seedMenus() {
  const count = await prisma.menu.count();
  if (count > 0) return { message: "이미 메뉴가 존재합니다" };

  const menus = [
    { label: "홈", href: "/", order: 0 },
    { label: "회사소개", href: "/about", order: 1 },
    { label: "서비스", href: "/services", order: 2 },
    { label: "포트폴리오", href: "/portfolio", order: 3 },
    { label: "문의하기", href: "/contact", order: 4 },
  ];

  for (const menu of menus) {
    await prisma.menu.create({ data: menu });
  }

  // 하위 메뉴
  const aboutMenu = await prisma.menu.findFirst({ where: { href: "/about" } });
  const servicesMenu = await prisma.menu.findFirst({
    where: { href: "/services" },
  });

  if (aboutMenu) {
    await prisma.menu.createMany({
      data: [
        {
          label: "인사말",
          href: "/about/greeting",
          order: 0,
          parentId: aboutMenu.id,
        },
        {
          label: "비전",
          href: "/about/vision",
          order: 1,
          parentId: aboutMenu.id,
        },
        {
          label: "연혁",
          href: "/about/history",
          order: 2,
          parentId: aboutMenu.id,
        },
        {
          label: "오시는 길",
          href: "/about/location",
          order: 3,
          parentId: aboutMenu.id,
        },
      ],
    });
  }

  if (servicesMenu) {
    await prisma.menu.createMany({
      data: [
        {
          label: "UX/UI 디자인",
          href: "/services/design",
          order: 0,
          parentId: servicesMenu.id,
        },
        {
          label: "웹 개발",
          href: "/services/web",
          order: 1,
          parentId: servicesMenu.id,
        },
        {
          label: "앱 개발",
          href: "/services/app",
          order: 2,
          parentId: servicesMenu.id,
        },
      ],
    });
  }

  revalidatePath("/admin/menus");
  return { message: "초기 메뉴가 생성되었습니다" };
}
