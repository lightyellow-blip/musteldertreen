"use client";

import { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type Inquiry, type InquiryStatus, updateInquiryStatus, deleteInquiry } from "./actions";

const STATUS_CONFIG: Record<InquiryStatus, { label: string; bg: string; text: string; border: string }> = {
  pending: { label: "대기", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  in_progress: { label: "처리중", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  completed: { label: "완료", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
};

function formatDate(date: Date) {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${d.getFullYear()}.${mm}.${dd} ${hh}:${min}`;
}

interface Props {
  initialInquiries: Inquiry[];
  initialStats: { total: number; pending: number; inProgress: number; completed: number };
}

export default function InquiriesClient({ initialInquiries, initialStats }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [inquiries, setInquiries] = useState(initialInquiries);
  const [stats, setStats] = useState(initialStats);

  const filtered = useMemo(() => {
    return inquiries.filter((item) => {
      if (filterStatus !== "all" && item.status !== filterStatus) return false;
      return true;
    });
  }, [inquiries, filterStatus]);

  async function handleStatusChange(id: string, newStatus: InquiryStatus) {
    // Optimistic update
    setInquiries((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus } : item
      )
    );

    startTransition(async () => {
      await updateInquiryStatus(id, newStatus);
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    if (!confirm("이 문의를 삭제하시겠습니까?")) return;

    // Optimistic update
    setInquiries((prev) => prev.filter((item) => item.id !== id));

    startTransition(async () => {
      await deleteInquiry(id);
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">문의 관리</h1>
            <p className="text-sm text-slate-500">고객 문의를 확인하고 관리합니다</p>
          </div>
          {isPending && (
            <div className="text-sm text-slate-500">저장 중...</div>
          )}
        </div>
      </header>

      <div className="p-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">전체</div>
            <div className="text-3xl font-bold text-slate-900">{stats.total}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-500"></div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">대기</div>
            </div>
            <div className="text-3xl font-bold text-red-600">{stats.pending}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-amber-500"></div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">처리중</div>
            </div>
            <div className="text-3xl font-bold text-amber-600">{stats.inProgress}</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">완료</div>
            </div>
            <div className="text-3xl font-bold text-emerald-600">{stats.completed}</div>
          </div>
        </div>

        {/* Filter & Table Card */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Filters */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-slate-500">상태</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="all">전체</option>
                <option value="pending">대기</option>
                <option value="in_progress">처리중</option>
                <option value="completed">완료</option>
              </select>
            </div>
            <div className="text-sm text-slate-500">
              <span className="font-medium text-slate-900">{filtered.length}</span>건
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50">
                  {["상태", "이름", "제목/내용", "접수일", "답변일", "관리"].map((h) => (
                    <th
                      key={h}
                      className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* 상태 */}
                    <td className="px-6 py-4">
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value as InquiryStatus)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold border cursor-pointer ${STATUS_CONFIG[item.status].bg} ${STATUS_CONFIG[item.status].text} ${STATUS_CONFIG[item.status].border}`}
                      >
                        <option value="pending">대기</option>
                        <option value="in_progress">처리중</option>
                        <option value="completed">완료</option>
                      </select>
                    </td>
                    {/* 이름 */}
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{item.email}</div>
                    </td>
                    {/* 제목/내용 */}
                    <td className="px-6 py-4 max-w-xs">
                      <Link
                        href={`/admin/inquiries/${item.id}`}
                        className="text-slate-900 hover:text-slate-600 font-medium transition-colors"
                      >
                        {item.subject || item.message.slice(0, 40) + "..."}
                      </Link>
                      {item.fileName && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-slate-500">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                          </svg>
                          {item.fileName}
                        </div>
                      )}
                    </td>
                    {/* 접수일 */}
                    <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {formatDate(item.createdAt)}
                    </td>
                    {/* 답변일 */}
                    <td className="px-6 py-4 text-sm whitespace-nowrap">
                      {item.repliedAt ? (
                        <div>
                          <div className="text-emerald-600 font-medium">{formatDate(item.repliedAt)}</div>
                          {item.repliedBy && (
                            <div className="text-xs text-slate-400 mt-0.5">{item.repliedBy}</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    {/* 관리 */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/inquiries/${item.id}`}
                          className="text-sm text-slate-600 hover:text-slate-900 font-medium transition-colors"
                        >
                          상세
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-sm text-slate-400 hover:text-red-600 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="text-slate-400">
                        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-sm">문의 내역이 없습니다.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
