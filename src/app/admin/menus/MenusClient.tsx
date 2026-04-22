"use client";

import { useState, useTransition } from "react";
import {
  type Menu,
  createMenu,
  updateMenu,
  deleteMenu,
  toggleMenuActive,
  reorderMenus,
  seedMenus,
} from "./actions";

interface Props {
  initialMenus: Menu[];
}

export default function MenusClient({ initialMenus }: Props) {
  const [menus, setMenus] = useState<Menu[]>(initialMenus);
  const [isPending, startTransition] = useTransition();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: "", href: "" });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ label: "", href: "", parentId: "" });

  const handleToggleActive = (id: string, currentActive: boolean) => {
    // Optimistic update
    setMenus((prev) =>
      prev.map((menu) => {
        if (menu.id === id) return { ...menu, isActive: !currentActive };
        if (menu.children) {
          return {
            ...menu,
            children: menu.children.map((child) =>
              child.id === id ? { ...child, isActive: !currentActive } : child
            ),
          };
        }
        return menu;
      })
    );

    startTransition(async () => {
      await toggleMenuActive(id, !currentActive);
    });
  };

  const startEdit = (menu: Menu) => {
    setEditingId(menu.id);
    setEditForm({ label: menu.label, href: menu.href });
  };

  const handleSaveEdit = (id: string) => {
    // Optimistic update
    setMenus((prev) =>
      prev.map((menu) => {
        if (menu.id === id) return { ...menu, ...editForm };
        if (menu.children) {
          return {
            ...menu,
            children: menu.children.map((child) =>
              child.id === id ? { ...child, ...editForm } : child
            ),
          };
        }
        return menu;
      })
    );
    setEditingId(null);

    startTransition(async () => {
      await updateMenu(id, editForm);
    });
  };

  const handleDelete = (id: string, parentId?: string) => {
    if (!confirm("이 메뉴를 삭제하시겠습니까?")) return;

    // Optimistic update
    setMenus((prev) => {
      if (parentId) {
        return prev.map((menu) => {
          if (menu.id === parentId && menu.children) {
            return {
              ...menu,
              children: menu.children.filter((child) => child.id !== id),
            };
          }
          return menu;
        });
      }
      return prev.filter((menu) => menu.id !== id);
    });

    startTransition(async () => {
      await deleteMenu(id);
    });
  };

  const handleAddMenu = () => {
    startTransition(async () => {
      await createMenu({
        label: addForm.label,
        href: addForm.href,
        parentId: addForm.parentId || undefined,
      });
      setShowAddModal(false);
      setAddForm({ label: "", href: "", parentId: "" });
      // 페이지가 revalidate 되므로 새로고침됨
      window.location.reload();
    });
  };

  const handleMove = (
    id: string,
    direction: "up" | "down",
    parentId: string | null
  ) => {
    // Optimistic update
    setMenus((prev) => {
      if (parentId) {
        return prev.map((menu) => {
          if (menu.id === parentId && menu.children) {
            const children = [...menu.children];
            const idx = children.findIndex((c) => c.id === id);
            if (direction === "up" && idx > 0) {
              [children[idx - 1], children[idx]] = [
                children[idx],
                children[idx - 1],
              ];
            } else if (direction === "down" && idx < children.length - 1) {
              [children[idx], children[idx + 1]] = [
                children[idx + 1],
                children[idx],
              ];
            }
            return { ...menu, children };
          }
          return menu;
        });
      }
      const arr = [...prev];
      const idx = arr.findIndex((m) => m.id === id);
      if (direction === "up" && idx > 0) {
        [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      } else if (direction === "down" && idx < arr.length - 1) {
        [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      }
      return arr;
    });

    startTransition(async () => {
      await reorderMenus(id, direction, parentId);
    });
  };

  const handleSeedMenus = () => {
    startTransition(async () => {
      await seedMenus();
      window.location.reload();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">메뉴 관리</h1>
            <p className="text-sm text-slate-500">
              사이트 메뉴 구성을 관리합니다
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isPending && (
              <span className="text-sm text-slate-500">저장 중...</span>
            )}
            {menus.length === 0 && (
              <button
                onClick={handleSeedMenus}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                기본 메뉴 생성
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
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
              메뉴 추가
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        {menus.length === 0 ? (
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
              기본 메뉴 생성 버튼을 클릭하여 샘플 메뉴를 추가하거나,
              <br />
              메뉴 추가 버튼을 클릭하여 새 메뉴를 만들어보세요.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <div className="w-8"></div>
                <div className="flex-1">메뉴명</div>
                <div className="w-48">URL</div>
                <div className="w-20 text-center">상태</div>
                <div className="w-32 text-center">순서</div>
                <div className="w-24 text-center">관리</div>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              {menus.map((menu, idx) => (
                <div key={menu.id}>
                  {/* Parent Menu */}
                  <div className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/50 transition-colors">
                    <div className="w-8">
                      {menu.children && menu.children.length > 0 && (
                        <svg
                          className="w-4 h-4 text-slate-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      {editingId === menu.id ? (
                        <input
                          type="text"
                          value={editForm.label}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              label: e.target.value,
                            }))
                          }
                          className="px-2 py-1 border border-slate-300 rounded text-sm w-full max-w-xs"
                        />
                      ) : (
                        <span className="font-medium text-slate-900">
                          {menu.label}
                        </span>
                      )}
                    </div>

                    <div className="w-48">
                      {editingId === menu.id ? (
                        <input
                          type="text"
                          value={editForm.href}
                          onChange={(e) =>
                            setEditForm((prev) => ({
                              ...prev,
                              href: e.target.value,
                            }))
                          }
                          className="px-2 py-1 border border-slate-300 rounded text-sm w-full"
                        />
                      ) : (
                        <span className="text-sm text-slate-500 font-mono">
                          {menu.href}
                        </span>
                      )}
                    </div>

                    <div className="w-20 text-center">
                      <button
                        onClick={() =>
                          handleToggleActive(menu.id, menu.isActive)
                        }
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          menu.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {menu.isActive ? "활성" : "비활성"}
                      </button>
                    </div>

                    <div className="w-32 flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleMove(menu.id, "up", null)}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
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
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleMove(menu.id, "down", null)}
                        disabled={idx === menus.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
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
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>

                    <div className="w-24 flex items-center justify-center gap-2">
                      {editingId === menu.id ? (
                        <>
                          <button
                            onClick={() => handleSaveEdit(menu.id)}
                            className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                          >
                            저장
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-sm text-slate-400 hover:text-slate-600"
                          >
                            취소
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => startEdit(menu)}
                            className="text-sm text-slate-600 hover:text-slate-900 font-medium"
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDelete(menu.id)}
                            className="text-sm text-slate-400 hover:text-red-600"
                          >
                            삭제
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Children */}
                  {menu.children &&
                    menu.children.map((child, childIdx) => (
                      <div
                        key={child.id}
                        className="flex items-center gap-4 px-6 py-3 bg-slate-50/30 hover:bg-slate-50 transition-colors"
                      >
                        <div className="w-8 flex justify-center">
                          <div className="w-4 h-4 border-l-2 border-b-2 border-slate-200 rounded-bl"></div>
                        </div>

                        <div className="flex-1 pl-2">
                          {editingId === child.id ? (
                            <input
                              type="text"
                              value={editForm.label}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  label: e.target.value,
                                }))
                              }
                              className="px-2 py-1 border border-slate-300 rounded text-sm w-full max-w-xs"
                            />
                          ) : (
                            <span className="text-sm text-slate-700">
                              {child.label}
                            </span>
                          )}
                        </div>

                        <div className="w-48">
                          {editingId === child.id ? (
                            <input
                              type="text"
                              value={editForm.href}
                              onChange={(e) =>
                                setEditForm((prev) => ({
                                  ...prev,
                                  href: e.target.value,
                                }))
                              }
                              className="px-2 py-1 border border-slate-300 rounded text-sm w-full"
                            />
                          ) : (
                            <span className="text-xs text-slate-400 font-mono">
                              {child.href}
                            </span>
                          )}
                        </div>

                        <div className="w-20 text-center">
                          <button
                            onClick={() =>
                              handleToggleActive(child.id, child.isActive)
                            }
                            className={`px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                              child.isActive
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {child.isActive ? "활성" : "비활성"}
                          </button>
                        </div>

                        <div className="w-32 flex items-center justify-center gap-1">
                          <button
                            onClick={() =>
                              handleMove(child.id, "up", menu.id)
                            }
                            disabled={childIdx === 0}
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 15l7-7 7 7"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() =>
                              handleMove(child.id, "down", menu.id)
                            }
                            disabled={
                              childIdx === (menu.children?.length || 0) - 1
                            }
                            className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </button>
                        </div>

                        <div className="w-24 flex items-center justify-center gap-2">
                          {editingId === child.id ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(child.id)}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                              >
                                저장
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-xs text-slate-400 hover:text-slate-600"
                              >
                                취소
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => startEdit(child)}
                                className="text-xs text-slate-500 hover:text-slate-700"
                              >
                                수정
                              </button>
                              <button
                                onClick={() => handleDelete(child.id, menu.id)}
                                className="text-xs text-slate-400 hover:text-red-600"
                              >
                                삭제
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              메뉴 추가
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  메뉴명
                </label>
                <input
                  type="text"
                  value={addForm.label}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, label: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="메뉴 이름 입력"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  URL
                </label>
                <input
                  type="text"
                  value={addForm.href}
                  onChange={(e) =>
                    setAddForm((prev) => ({ ...prev, href: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="/example"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  상위 메뉴 (선택)
                </label>
                <select
                  value={addForm.parentId}
                  onChange={(e) =>
                    setAddForm((prev) => ({
                      ...prev,
                      parentId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">최상위 메뉴</option>
                  {menus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
              >
                취소
              </button>
              <button
                onClick={handleAddMenu}
                disabled={!addForm.label || !addForm.href || isPending}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "추가 중..." : "추가"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
