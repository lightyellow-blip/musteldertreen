"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { Prisma } from "@/generated/prisma/client";

// 타입 정의
export type ContentType = "text" | "image" | "video" | "gallery";

export interface Content {
  id: string;
  type: string;
  title: string;
  data: Prisma.JsonValue;
  order: number;
  sectionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Section {
  id: string;
  name: string;
  order: number;
  menuId: string;
  contents: Content[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MenuWithSections {
  id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
  parentId: string | null;
  sections: Section[];
  children?: MenuWithSections[];
  createdAt: Date;
  updatedAt: Date;
}

// 모든 메뉴 가져오기 (섹션, 콘텐츠 포함)
export async function getMenusWithContents(): Promise<MenuWithSections[]> {
  const menus = await prisma.menu.findMany({
    where: { parentId: null },
    orderBy: { order: "asc" },
    include: {
      sections: {
        orderBy: { order: "asc" },
        include: {
          contents: {
            orderBy: { order: "asc" },
          },
        },
      },
      children: {
        orderBy: { order: "asc" },
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
      },
    },
  });
  return menus;
}

// 섹션 생성
export async function createSection(data: { name: string; menuId: string }) {
  const maxOrder = await prisma.section.aggregate({
    where: { menuId: data.menuId },
    _max: { order: true },
  });

  const section = await prisma.section.create({
    data: {
      name: data.name,
      menuId: data.menuId,
      order: (maxOrder._max.order ?? -1) + 1,
    },
    include: {
      contents: true,
    },
  });
  revalidatePath("/admin/contents");
  return section;
}

// 섹션 삭제
export async function deleteSection(id: string) {
  await prisma.section.delete({
    where: { id },
  });
  revalidatePath("/admin/contents");
}

// 콘텐츠 생성
export async function createContent(data: {
  type: ContentType;
  title: string;
  sectionId: string;
}) {
  const maxOrder = await prisma.content.aggregate({
    where: { sectionId: data.sectionId },
    _max: { order: true },
  });

  const content = await prisma.content.create({
    data: {
      type: data.type,
      title: data.title,
      sectionId: data.sectionId,
      order: (maxOrder._max.order ?? -1) + 1,
      data: {},
    },
  });
  revalidatePath("/admin/contents");
  return content;
}

// 콘텐츠 수정
export async function updateContent(
  id: string,
  data: { title?: string; data?: Prisma.InputJsonValue }
) {
  const content = await prisma.content.update({
    where: { id },
    data,
  });
  revalidatePath("/admin/contents");
  return content;
}

// 콘텐츠 삭제
export async function deleteContent(id: string) {
  await prisma.content.delete({
    where: { id },
  });
  revalidatePath("/admin/contents");
}
