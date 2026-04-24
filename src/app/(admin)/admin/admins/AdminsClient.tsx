"use client";

import { useState, useEffect } from "react";

interface Admin {
  id: string;
  email: string;
  name: string;
  role: "SUPER_ADMIN" | "ADMIN";
  permissions: string[];
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

const PERMISSION_LABELS: Record<string, string> = {
  menus: "메뉴 관리",
  contents: "콘텐츠 관리",
  inquiries: "문의 관리",
  analytics: "접속통계",
  settings: "설정",
};

const ALL_PERMISSIONS = Object.keys(PERMISSION_LABELS);

export default function AdminsClient() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    permissions: [] as string[],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins);
      }
    } catch (error) {
      console.error("Failed to fetch admins:", error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAdmin(null);
    setFormData({ email: "", password: "", name: "", permissions: [] });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      email: admin.email,
      password: "",
      name: admin.name,
      permissions: admin.permissions,
    });
    setError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      if (editingAdmin) {
        // 수정
        const res = await fetch(`/api/admin/admins/${editingAdmin.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            password: formData.password || undefined,
            permissions: formData.permissions,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setShowModal(false);
          fetchAdmins();
        } else {
          setError(data.error);
        }
      } else {
        // 생성
        const res = await fetch("/api/admin/admins", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (data.success) {
          setShowModal(false);
          fetchAdmins();
        } else {
          setError(data.error);
        }
      }
    } catch {
      setError("저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (admin: Admin) => {
    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !admin.isActive }),
      });
      const data = await res.json();
      if (data.success) {
        fetchAdmins();
      }
    } catch (error) {
      console.error("Failed to toggle admin:", error);
    }
  };

  const deleteAdmin = async (admin: Admin) => {
    if (!confirm(`${admin.name} 관리자를 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch(`/api/admin/admins/${admin.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        fetchAdmins();
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("Failed to delete admin:", error);
    }
  };

  const togglePermission = (permission: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter((p) => p !== permission)
        : [...prev.permissions, permission],
    }));
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <header className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">관리자 관리</h1>
            <p className="text-white/40 text-sm">관리자 계정을 등록하고 권한을 관리합니다</p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl text-sm font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all duration-300 shadow-lg shadow-purple-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            관리자 추가
          </button>
        </div>
      </header>

      {/* Admin List */}
      <div className="glass rounded-2xl overflow-hidden animate-fade-in-up animation-delay-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">관리자</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">역할</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">권한</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">상태</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">마지막 로그인</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-white/40 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-white/40">
                    로딩 중...
                  </td>
                </tr>
              ) : admins.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-white/40">
                    등록된 관리자가 없습니다
                  </td>
                </tr>
              ) : (
                admins.map((admin) => (
                  <tr key={admin.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          admin.role === "SUPER_ADMIN"
                            ? "bg-gradient-to-br from-amber-400 to-orange-500"
                            : "bg-gradient-to-br from-cyan-400 to-blue-500"
                        }`}>
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <div>
                          <div className="text-white font-medium">{admin.name}</div>
                          <div className="text-white/40 text-sm">{admin.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {admin.role === "SUPER_ADMIN" ? (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 rounded-lg text-xs font-semibold">
                          최고관리자
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 rounded-lg text-xs font-semibold">
                          일반관리자
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {admin.role === "SUPER_ADMIN" ? (
                        <span className="text-white/40 text-sm">모든 권한</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {admin.permissions.length === 0 ? (
                            <span className="text-white/30 text-sm">권한 없음</span>
                          ) : (
                            admin.permissions.map((perm) => (
                              <span
                                key={perm}
                                className="px-2 py-0.5 bg-white/[0.06] text-white/60 rounded text-[10px]"
                              >
                                {PERMISSION_LABELS[perm] || perm}
                              </span>
                            ))
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {admin.isActive ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-400" />
                          활성
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-white/30 text-sm">
                          <span className="w-2 h-2 rounded-full bg-white/30" />
                          비활성
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white/40 text-sm">
                      {formatDate(admin.lastLoginAt)}
                    </td>
                    <td className="px-6 py-4">
                      {admin.role !== "SUPER_ADMIN" && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(admin)}
                            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.06] transition-all"
                            title="수정"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => toggleActive(admin)}
                            className={`p-2 rounded-lg transition-all ${
                              admin.isActive
                                ? "text-amber-400 hover:bg-amber-500/10"
                                : "text-emerald-400 hover:bg-emerald-500/10"
                            }`}
                            title={admin.isActive ? "비활성화" : "활성화"}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                          <button
                            onClick={() => deleteAdmin(admin)}
                            className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-all"
                            title="삭제"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass rounded-2xl w-full max-w-lg p-6 animate-fade-in-up">
            <h2 className="text-xl font-bold text-white mb-6">
              {editingAdmin ? "관리자 수정" : "관리자 추가"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">이메일</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={!!editingAdmin}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  required={!editingAdmin}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">이름</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">
                  비밀번호 {editingAdmin && <span className="text-white/30">(변경시에만 입력)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-violet-500/50 transition-all"
                  required={!editingAdmin}
                />
              </div>

              {/* Permissions */}
              <div>
                <label className="block text-sm font-medium text-white/60 mb-3">권한</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_PERMISSIONS.map((perm) => (
                    <label
                      key={perm}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                        formData.permissions.includes(perm)
                          ? "bg-violet-500/20 border border-violet-500/30"
                          : "bg-white/[0.03] border border-white/[0.08] hover:bg-white/[0.06]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                        className="sr-only"
                      />
                      <span className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                        formData.permissions.includes(perm)
                          ? "bg-violet-500 border-violet-500"
                          : "border-white/20"
                      }`}>
                        {formData.permissions.includes(perm) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </span>
                      <span className="text-white/80 text-sm">{PERMISSION_LABELS[perm]}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="px-4 py-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-white/[0.06] text-white/70 rounded-xl font-medium hover:bg-white/[0.1] transition-all"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl font-semibold hover:from-violet-600 hover:to-fuchsia-600 transition-all disabled:opacity-50"
                >
                  {saving ? "저장 중..." : editingAdmin ? "수정" : "추가"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
