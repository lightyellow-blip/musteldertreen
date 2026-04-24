"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { AdminSession } from "@/lib/auth";

interface Props {
  session: AdminSession;
}

export default function ProfileClient({ session }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [name, setName] = useState(session.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setMessage(null);

    // 비밀번호 변경 시 검증
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        setMessage({ type: "error", text: "현재 비밀번호를 입력해주세요." });
        return;
      }
      if (newPassword.length < 6) {
        setMessage({ type: "error", text: "새 비밀번호는 6자 이상이어야 합니다." });
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage({ type: "error", text: "새 비밀번호가 일치하지 않습니다." });
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "수정에 실패했습니다." });
        return;
      }

      setMessage({ type: "success", text: "정보가 수정되었습니다." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // 세션 갱신을 위해 새로고침
      setTimeout(() => {
        router.refresh();
      }, 1000);
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header - 스크롤 고정 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">내 정보 수정</h1>
          <div className="flex items-center gap-3">
            {isLoading && (
              <span className="text-sm text-slate-500">저장 중...</span>
            )}
            {message && (
              <span className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                {message.text}
              </span>
            )}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isLoading || !name.trim()}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                message?.type === "success"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {message?.type === "success" ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  저장 완료
                </span>
              ) : (
                "변경사항 저장"
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-xl">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* 기본 정보 */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-semibold text-slate-900">기본 정보</h2>
                <p className="text-xs text-slate-500 mt-0.5">이름을 수정할 수 있습니다</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={session.email}
                    disabled
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500 mt-1">이메일은 변경할 수 없습니다</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    이름 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    역할
                  </label>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        session.role === "SUPER_ADMIN"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {session.role === "SUPER_ADMIN" ? "최고관리자" : "관리자"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 비밀번호 변경 */}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <h2 className="text-sm font-semibold text-slate-900">비밀번호 변경</h2>
                <p className="text-xs text-slate-500 mt-0.5">비밀번호를 변경하려면 모든 필드를 입력하세요</p>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    현재 비밀번호
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="현재 비밀번호 입력"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    새 비밀번호
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호 입력 (6자 이상)"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    새 비밀번호 확인
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="새 비밀번호 다시 입력"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
