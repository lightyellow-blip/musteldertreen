"use client";

import { useState, useEffect } from "react";

interface IpEntry {
  id: string;
  ip: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
}

export default function IpManagementClient() {
  const [ips, setIps] = useState<IpEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [newIp, setNewIp] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetchIps();
  }, []);

  const fetchIps = async () => {
    try {
      const res = await fetch("/api/admin/ip-whitelist");
      if (res.ok) {
        const data = await res.json();
        setIps(data);
      }
    } catch {
      setError("IP 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIp.trim()) return;

    setIsAdding(true);
    setMessage(null);

    try {
      const res = await fetch("/api/admin/ip-whitelist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ip: newIp.trim(),
          description: newDescription.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIps([data, ...ips]);
        setNewIp("");
        setNewDescription("");
        setMessage({ type: "success", text: "IP가 추가되었습니다." });
      } else {
        setMessage({ type: "error", text: data.error || "IP 추가에 실패했습니다." });
      }
    } catch {
      setMessage({ type: "error", text: "서버 오류가 발생했습니다." });
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/admin/ip-whitelist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        setIps(ips.map((ip) => (ip.id === id ? { ...ip, isActive: !isActive } : ip)));
      }
    } catch {
      setMessage({ type: "error", text: "상태 변경에 실패했습니다." });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("이 IP를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/admin/ip-whitelist/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIps(ips.filter((ip) => ip.id !== id));
        setMessage({ type: "success", text: "IP가 삭제되었습니다." });
      }
    } catch {
      setMessage({ type: "error", text: "IP 삭제에 실패했습니다." });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative z-10">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">IP 관리</h1>
          {message && (
            <span className={`text-sm ${message.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
              {message.text}
            </span>
          )}
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-4xl space-y-6">
          {/* 안내 */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-amber-800">IP 화이트리스트 설정</p>
                <p className="text-sm text-amber-700 mt-1">
                  등록된 IP만 어드민 페이지에 접속할 수 있습니다.<br />
                  IP가 하나도 등록되지 않으면 모든 IP에서 접속 가능합니다.
                </p>
              </div>
            </div>
          </div>

          {/* IP 추가 폼 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <h2 className="text-sm font-semibold text-slate-900">IP 추가</h2>
            </div>
            <form onSubmit={handleAdd} className="p-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">IP 주소</label>
                  <input
                    type="text"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                    placeholder="예: 123.456.789.0 또는 123.456.789.0/24"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">설명 (선택)</label>
                  <input
                    type="text"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="예: 본사, 홍길동 PC"
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={isAdding || !newIp.trim()}
                    className="px-4 py-2.5 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAdding ? "추가 중..." : "추가"}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* IP 목록 */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">등록된 IP 목록</h2>
              <span className="text-xs text-slate-500">{ips.length}개</span>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">불러오는 중...</div>
            ) : error ? (
              <div className="p-8 text-center text-red-500">{error}</div>
            ) : ips.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <p className="text-slate-500 text-sm">등록된 IP가 없습니다.</p>
                <p className="text-slate-400 text-xs mt-1">모든 IP에서 접속 가능합니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {ips.map((ip) => (
                  <div key={ip.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${ip.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                      <div>
                        <span className="font-mono text-sm text-slate-900">{ip.ip}</span>
                        {ip.description && (
                          <span className="ml-3 text-sm text-slate-500">{ip.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggle(ip.id, ip.isActive)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                          ip.isActive
                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        {ip.isActive ? "활성" : "비활성"}
                      </button>
                      <button
                        onClick={() => handleDelete(ip.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
