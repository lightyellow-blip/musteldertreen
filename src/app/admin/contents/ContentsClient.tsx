"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  type MenuWithSections,
  type Section,
  type Content,
  type ContentType,
  createSection,
  deleteSection,
  createContent,
  updateContent,
  deleteContent,
} from "./actions";
import type { Prisma } from "@/generated/prisma/client";

const CONTENT_TYPE_CONFIG: Record<
  ContentType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  text: {
    label: "텍스트",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 6h16M4 12h16M4 18h7"
        />
      </svg>
    ),
    color: "bg-blue-100 text-blue-700",
  },
  image: {
    label: "이미지",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    ),
    color: "bg-emerald-100 text-emerald-700",
  },
  video: {
    label: "영상",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    color: "bg-purple-100 text-purple-700",
  },
  gallery: {
    label: "갤러리",
    icon: (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
      </svg>
    ),
    color: "bg-amber-100 text-amber-700",
  },
};

// 플랫 메뉴 리스트 생성 (부모 + 자식)
function flattenMenus(menus: MenuWithSections[]): MenuWithSections[] {
  const result: MenuWithSections[] = [];
  for (const menu of menus) {
    result.push(menu);
    if (menu.children) {
      for (const child of menu.children) {
        result.push(child);
      }
    }
  }
  return result;
}

interface Props {
  initialMenus: MenuWithSections[];
}

export default function ContentsClient({ initialMenus }: Props) {
  const [menus, setMenus] = useState<MenuWithSections[]>(initialMenus);
  const [isPending, startTransition] = useTransition();
  const flatMenus = flattenMenus(menus);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(
    flatMenus[0]?.id || null
  );
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(
    flatMenus[0]?.sections[0]?.id || null
  );
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [editingData, setEditingData] = useState<Record<string, unknown>>({});
  const [showAddSection, setShowAddSection] = useState(false);
  const [showAddContent, setShowAddContent] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newContentType, setNewContentType] = useState<ContentType>("text");
  const [newContentTitle, setNewContentTitle] = useState("");

  const selectedMenu = flatMenus.find((m) => m.id === selectedMenuId);
  const selectedSection = selectedMenu?.sections.find(
    (s) => s.id === selectedSectionId
  );

  const handleAddSection = () => {
    if (!newSectionName.trim() || !selectedMenuId) return;

    startTransition(async () => {
      const section = await createSection({
        name: newSectionName,
        menuId: selectedMenuId,
      });

      // 상태 업데이트
      setMenus((prev) =>
        prev.map((menu) => {
          if (menu.id === selectedMenuId) {
            return { ...menu, sections: [...menu.sections, section] };
          }
          if (menu.children) {
            return {
              ...menu,
              children: menu.children.map((child) =>
                child.id === selectedMenuId
                  ? { ...child, sections: [...child.sections, section] }
                  : child
              ),
            };
          }
          return menu;
        })
      );

      setNewSectionName("");
      setShowAddSection(false);
      setSelectedSectionId(section.id);
    });
  };

  const handleDeleteSection = (sectionId: string) => {
    if (!confirm("이 섹션을 삭제하시겠습니까?")) return;

    // Optimistic update
    setMenus((prev) =>
      prev.map((menu) => {
        if (menu.id === selectedMenuId) {
          return {
            ...menu,
            sections: menu.sections.filter((s) => s.id !== sectionId),
          };
        }
        if (menu.children) {
          return {
            ...menu,
            children: menu.children.map((child) =>
              child.id === selectedMenuId
                ? {
                    ...child,
                    sections: child.sections.filter((s) => s.id !== sectionId),
                  }
                : child
            ),
          };
        }
        return menu;
      })
    );

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }

    startTransition(async () => {
      await deleteSection(sectionId);
    });
  };

  const handleAddContent = () => {
    if (!newContentTitle.trim() || !selectedSectionId) return;

    startTransition(async () => {
      const content = await createContent({
        type: newContentType,
        title: newContentTitle,
        sectionId: selectedSectionId,
      });

      // 상태 업데이트
      setMenus((prev) =>
        prev.map((menu) => {
          const updateSections = (sections: Section[]) =>
            sections.map((s) =>
              s.id === selectedSectionId
                ? { ...s, contents: [...s.contents, content] }
                : s
            );

          if (menu.id === selectedMenuId) {
            return { ...menu, sections: updateSections(menu.sections) };
          }
          if (menu.children) {
            return {
              ...menu,
              children: menu.children.map((child) =>
                child.id === selectedMenuId
                  ? { ...child, sections: updateSections(child.sections) }
                  : child
              ),
            };
          }
          return menu;
        })
      );

      setNewContentTitle("");
      setNewContentType("text");
      setShowAddContent(false);
    });
  };

  const handleDeleteContent = (contentId: string) => {
    if (!confirm("이 콘텐츠를 삭제하시겠습니까?")) return;

    // Optimistic update
    setMenus((prev) =>
      prev.map((menu) => {
        const updateSections = (sections: Section[]) =>
          sections.map((s) =>
            s.id === selectedSectionId
              ? { ...s, contents: s.contents.filter((c) => c.id !== contentId) }
              : s
          );

        if (menu.id === selectedMenuId) {
          return { ...menu, sections: updateSections(menu.sections) };
        }
        if (menu.children) {
          return {
            ...menu,
            children: menu.children.map((child) =>
              child.id === selectedMenuId
                ? { ...child, sections: updateSections(child.sections) }
                : child
            ),
          };
        }
        return menu;
      })
    );

    startTransition(async () => {
      await deleteContent(contentId);
    });
  };

  const handleEditContent = (content: Content) => {
    setEditingContent(content);
    setEditingData(content.data as Record<string, unknown>);
  };

  const handleSaveContent = () => {
    if (!editingContent) return;

    // Optimistic update
    setMenus((prev) =>
      prev.map((menu) => {
        const updateSections = (sections: Section[]) =>
          sections.map((s) =>
            s.id === selectedSectionId
              ? {
                  ...s,
                  contents: s.contents.map((c) =>
                    c.id === editingContent.id
                      ? { ...c, data: editingData as Prisma.JsonValue }
                      : c
                  ),
                }
              : s
          );

        if (menu.id === selectedMenuId) {
          return { ...menu, sections: updateSections(menu.sections) };
        }
        if (menu.children) {
          return {
            ...menu,
            children: menu.children.map((child) =>
              child.id === selectedMenuId
                ? { ...child, sections: updateSections(child.sections) }
                : child
            ),
          };
        }
        return menu;
      })
    );

    startTransition(async () => {
      await updateContent(editingContent.id, {
        data: editingData as Prisma.InputJsonValue,
      });
    });

    setEditingContent(null);
    setEditingData({});
  };

  const getContentText = (content: Content): string => {
    const data = content.data as Record<string, unknown>;
    return (data?.text as string) || "";
  };

  const getContentUrl = (content: Content): string => {
    const data = content.data as Record<string, unknown>;
    return (data?.url as string) || "";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">콘텐츠 관리</h1>
          <div className="flex items-center gap-3">
            {isPending && (
              <span className="text-sm text-slate-500">저장 중...</span>
            )}
          </div>
        </div>
      </header>

      {flatMenus.length === 0 ? (
        <div className="p-8">
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">
              등록된 메뉴가 없습니다
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              메뉴 관리에서 먼저 메뉴를 등록해주세요.
              <br />
              등록된 메뉴의 콘텐츠를 이곳에서 관리할 수 있습니다.
            </p>
            <Link
              href="/admin/menus"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              메뉴 관리로 이동
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex h-[calc(100vh-64px)]">
          {/* Left Panel - Menu List */}
          <div className="w-56 bg-white border-r border-slate-200 flex-shrink-0">
            <div className="p-4 border-b border-slate-100">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                메뉴 (페이지)
              </h2>
            </div>
            <nav className="p-2">
              {menus.map((menu) => (
                <div key={menu.id}>
                  {/* 부모 메뉴 */}
                  <button
                    onClick={() => {
                      setSelectedMenuId(menu.id);
                      setSelectedSectionId(menu.sections[0]?.id || null);
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedMenuId === menu.id
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{menu.label}</span>
                      <span
                        className={`text-xs ${
                          selectedMenuId === menu.id
                            ? "text-slate-400"
                            : "text-slate-400"
                        }`}
                      >
                        {menu.sections.length}
                      </span>
                    </div>
                    <div
                      className={`text-xs mt-0.5 ${
                        selectedMenuId === menu.id
                          ? "text-slate-400"
                          : "text-slate-400"
                      }`}
                    >
                      {menu.href}
                    </div>
                  </button>

                  {/* 자식 메뉴 */}
                  {menu.children &&
                    menu.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => {
                          setSelectedMenuId(child.id);
                          setSelectedSectionId(child.sections[0]?.id || null);
                        }}
                        className={`w-full text-left px-3 py-2 pl-6 rounded-lg text-sm transition-colors ${
                          selectedMenuId === child.id
                            ? "bg-slate-800 text-white"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-slate-300">└</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span>{child.label}</span>
                              <span className="text-xs text-slate-400">
                                {child.sections.length}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                </div>
              ))}
            </nav>
          </div>

          {/* Middle Panel - Section List */}
          <div className="w-64 bg-slate-50 border-r border-slate-200 flex-shrink-0">
            <div className="p-4 border-b border-slate-100 bg-white flex items-center justify-between">
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                섹션
              </h2>
              <button
                onClick={() => setShowAddSection(true)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </button>
            </div>
            <div className="p-2">
              {selectedMenu?.sections.map((section) => (
                <div
                  key={section.id}
                  onClick={() => setSelectedSectionId(section.id)}
                  className={`group rounded-lg transition-colors cursor-pointer ${
                    selectedSectionId === section.id
                      ? "bg-white shadow-sm"
                      : "hover:bg-white"
                  }`}
                >
                  <div className="w-full text-left px-3 py-3">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          selectedSectionId === section.id
                            ? "text-slate-900"
                            : "text-slate-600"
                        }`}
                      >
                        {section.name}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id);
                        }}
                        className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      {section.contents.slice(0, 3).map((content) => (
                        <span
                          key={content.id}
                          className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${
                            CONTENT_TYPE_CONFIG[content.type as ContentType]
                              ?.color
                          }`}
                        >
                          {
                            CONTENT_TYPE_CONFIG[content.type as ContentType]
                              ?.icon
                          }
                        </span>
                      ))}
                      {section.contents.length > 3 && (
                        <span className="text-xs text-slate-400">
                          +{section.contents.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {selectedMenu?.sections.length === 0 && (
                <div className="text-center py-8 text-sm text-slate-400">
                  섹션이 없습니다
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Content Editor */}
          <div className="flex-1 overflow-auto">
            {selectedSection ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      {selectedSection.name}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {selectedSection.contents.length}개 콘텐츠
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddContent(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    콘텐츠 추가
                  </button>
                </div>

                <div className="space-y-3">
                  {selectedSection.contents.map((content) => (
                    <div
                      key={content.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              CONTENT_TYPE_CONFIG[content.type as ContentType]
                                ?.color
                            }`}
                          >
                            {
                              CONTENT_TYPE_CONFIG[content.type as ContentType]
                                ?.icon
                            }
                          </div>
                          <div>
                            <h3 className="font-medium text-slate-900">
                              {content.title}
                            </h3>
                            <span className="text-xs text-slate-500">
                              {
                                CONTENT_TYPE_CONFIG[content.type as ContentType]
                                  ?.label
                              }
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEditContent(content)}
                            className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteContent(content.id)}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Content Preview */}
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        {content.type === "text" && (
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {getContentText(content) ||
                              "텍스트를 입력하세요..."}
                          </p>
                        )}
                        {content.type === "image" && (
                          <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                            {getContentUrl(content) ? (
                              <span className="text-xs text-slate-500">
                                {getContentUrl(content)}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">
                                이미지를 업로드하세요
                              </span>
                            )}
                          </div>
                        )}
                        {content.type === "video" && (
                          <div className="w-full h-24 bg-slate-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs text-slate-400">
                              영상 URL을 입력하세요
                            </span>
                          </div>
                        )}
                        {content.type === "gallery" && (
                          <div className="flex gap-2">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center"
                              >
                                <svg
                                  className="w-6 h-6 text-slate-300"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 4v16m8-8H4"
                                  />
                                </svg>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {selectedSection.contents.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                      <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg
                          className="w-6 h-6 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                          />
                        </svg>
                      </div>
                      <p className="text-slate-500 mb-3">콘텐츠가 없습니다</p>
                      <button
                        onClick={() => setShowAddContent(true)}
                        className="text-sm text-slate-900 font-medium hover:underline"
                      >
                        첫 번째 콘텐츠 추가하기
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <p className="text-slate-500">섹션을 선택하거나 추가하세요</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add Section Modal */}
      {showAddSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              섹션 추가
            </h2>
            <input
              type="text"
              placeholder="섹션 이름"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent mb-4"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddSection(false);
                  setNewSectionName("");
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddSection}
                disabled={!newSectionName.trim() || isPending}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Content Modal */}
      {showAddContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              콘텐츠 추가
            </h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                콘텐츠 타입
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(Object.keys(CONTENT_TYPE_CONFIG) as ContentType[]).map(
                  (type) => (
                    <button
                      key={type}
                      onClick={() => setNewContentType(type)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all ${
                        newContentType === type
                          ? "border-slate-900 bg-slate-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${CONTENT_TYPE_CONFIG[type].color}`}
                      >
                        {CONTENT_TYPE_CONFIG[type].icon}
                      </div>
                      <span className="text-xs font-medium text-slate-600">
                        {CONTENT_TYPE_CONFIG[type].label}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                콘텐츠 제목
              </label>
              <input
                type="text"
                placeholder="예: 메인 타이틀"
                value={newContentTitle}
                onChange={(e) => setNewContentTitle(e.target.value)}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowAddContent(false);
                  setNewContentTitle("");
                  setNewContentType("text");
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleAddContent}
                disabled={!newContentTitle.trim() || isPending}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Content Modal */}
      {editingContent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    CONTENT_TYPE_CONFIG[editingContent.type as ContentType]
                      ?.color
                  }`}
                >
                  {
                    CONTENT_TYPE_CONFIG[editingContent.type as ContentType]
                      ?.icon
                  }
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingContent.title}
                  </h2>
                  <span className="text-sm text-slate-500">
                    {
                      CONTENT_TYPE_CONFIG[editingContent.type as ContentType]
                        ?.label
                    }
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingContent(null)}
                className="p-2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="border-t border-slate-200 pt-4">
              {editingContent.type === "text" && (
                <textarea
                  className="w-full h-48 px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                  placeholder="텍스트를 입력하세요..."
                  value={(editingData.text as string) || ""}
                  onChange={(e) =>
                    setEditingData({ ...editingData, text: e.target.value })
                  }
                />
              )}
              {editingContent.type === "image" && (
                <div className="space-y-4">
                  <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                    <div className="text-center">
                      <svg
                        className="w-8 h-8 text-slate-400 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <p className="text-sm text-slate-500">
                        클릭하여 이미지 업로드
                      </p>
                    </div>
                  </div>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="또는 이미지 URL 입력"
                    value={(editingData.url as string) || ""}
                    onChange={(e) =>
                      setEditingData({ ...editingData, url: e.target.value })
                    }
                  />
                </div>
              )}
              {editingContent.type === "video" && (
                <input
                  type="text"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  placeholder="YouTube 또는 Vimeo URL 입력"
                  value={(editingData.url as string) || ""}
                  onChange={(e) =>
                    setEditingData({ ...editingData, url: e.target.value })
                  }
                />
              )}
              {editingContent.type === "gallery" && (
                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300 hover:border-slate-400 cursor-pointer transition-colors"
                    >
                      <svg
                        className="w-6 h-6 text-slate-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-200">
              <button
                onClick={() => setEditingContent(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSaveContent}
                disabled={isPending}
                className="px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50"
              >
                {isPending ? "저장 중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
