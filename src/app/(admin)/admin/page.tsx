import Link from "next/link";
import { getDashboardStats, getRecentInquiries, getPendingInquiries } from "./actions";

function formatDate(date: Date) {
  const d = new Date(date);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}.${dd}`;
}

function formatTime(date: Date) {
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

const STATUS_CONFIG = {
  pending: { label: "대기", bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-500", glow: "shadow-rose-500/20" },
  in_progress: { label: "처리중", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-500", glow: "shadow-amber-500/20" },
  completed: { label: "완료", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-500", glow: "shadow-emerald-500/20" },
} as const;

export default async function AdminDashboard() {
  const [counts, recentInquiries, pendingInquiries] = await Promise.all([
    getDashboardStats(),
    getRecentInquiries(),
    getPendingInquiries(),
  ]);

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <header className="mb-8 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">대시보드</h1>
            <p className="text-white/40 text-sm">머스트 엘더트리엔 관리자 콘솔에 오신 것을 환영합니다</p>
          </div>
          <div className="glass rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white/60 text-sm">
              {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" })}
            </span>
          </div>
        </div>
      </header>

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl mb-8 animate-fade-in-up animation-delay-100">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-fuchsia-600/20" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="glass relative p-8 border-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">👋</span>
                <span className="text-white/40 text-sm font-medium">Good to see you!</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                안녕하세요, <span className="text-gradient">관리자</span>님
              </h2>
              <p className="text-white/50 mb-6 max-w-md">
                오늘도 머스트 엘더트리엔과 함께 좋은 하루 되세요. 새로운 문의 {counts.pending}건이 대기 중입니다.
              </p>
              <div className="flex gap-3">
                <Link
                  href="/admin/inquiries"
                  className="group inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 rounded-xl text-sm font-semibold hover:bg-white/90 transition-all duration-300 hover:shadow-lg hover:shadow-white/10"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  문의 확인하기
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  href="/"
                  target="_blank"
                  className="inline-flex items-center gap-2 px-5 py-2.5 glass rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  사이트 보기
                </Link>
              </div>
            </div>
            <div className="hidden lg:block">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 rounded-full blur-3xl" />
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="text-8xl">🌳</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        {/* Total */}
        <div className="glass rounded-2xl p-6 hover-lift glass-hover cursor-pointer group animate-fade-in-up animation-delay-100">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500/20 to-slate-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <div className="px-2 py-1 rounded-lg bg-white/[0.03] text-[10px] font-medium text-white/30">ALL TIME</div>
          </div>
          <div className="text-4xl font-bold text-white mb-1 tracking-tight">{counts.total}</div>
          <div className="text-sm text-white/40">전체 문의</div>
        </div>

        {/* Pending */}
        <div className="glass rounded-2xl p-6 hover-lift glass-hover cursor-pointer group animate-fade-in-up animation-delay-200 relative overflow-hidden">
          {counts.pending > 0 && (
            <div className="absolute top-3 right-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
              </span>
            </div>
          )}
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-rose-500/10">
              <svg className="w-6 h-6 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            {counts.pending > 0 && (
              <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 rounded-lg text-[10px] font-semibold uppercase tracking-wider">
                처리 필요
              </span>
            )}
          </div>
          <div className="text-4xl font-bold text-rose-400 mb-1 tracking-tight">{counts.pending}</div>
          <div className="text-sm text-white/40">대기 중</div>
        </div>

        {/* In Progress */}
        <div className="glass rounded-2xl p-6 hover-lift glass-hover cursor-pointer group animate-fade-in-up animation-delay-300">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-amber-500/10">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-amber-400 mb-1 tracking-tight">{counts.in_progress}</div>
          <div className="text-sm text-white/40">처리 중</div>
        </div>

        {/* Completed */}
        <div className="glass rounded-2xl p-6 hover-lift glass-hover cursor-pointer group animate-fade-in-up animation-delay-400">
          <div className="flex items-start justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-emerald-500/10">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-4xl font-bold text-emerald-400 mb-1 tracking-tight">{counts.completed}</div>
          <div className="text-sm text-white/40">완료</div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Recent Inquiries */}
        <div className="glass rounded-2xl overflow-hidden animate-fade-in-up animation-delay-200">
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">최근 문의</h3>
            </div>
            <Link href="/admin/inquiries" className="text-xs text-white/40 hover:text-violet-400 transition-colors flex items-center gap-1 group">
              전체 보기
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentInquiries.map((inquiry, idx) => (
              <Link
                key={inquiry.id}
                href={`/admin/inquiries/${inquiry.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-all duration-200 group"
                style={{ animationDelay: `${(idx + 3) * 100}ms` }}
              >
                <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[inquiry.status as keyof typeof STATUS_CONFIG]?.dot || "bg-slate-500"} shadow-lg ${STATUS_CONFIG[inquiry.status as keyof typeof STATUS_CONFIG]?.glow || ""}`} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white/90 truncate group-hover:text-white transition-colors text-sm">
                    {inquiry.subject || inquiry.message.slice(0, 30) + "..."}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">{inquiry.name}</div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-white/30">{formatDate(inquiry.createdAt)}</span>
                  <span className="text-[10px] text-white/20">{formatTime(inquiry.createdAt)}</span>
                </div>
              </Link>
            ))}
            {recentInquiries.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
                  <svg className="w-8 h-8 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                </div>
                <p className="text-sm text-white/30">문의 내역이 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* Pending Inquiries */}
        <div className="glass rounded-2xl overflow-hidden animate-fade-in-up animation-delay-300">
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold text-white">처리 대기</h3>
              {counts.pending > 0 && (
                <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 rounded-md text-[10px] font-semibold">
                  {counts.pending}
                </span>
              )}
            </div>
            <Link href="/admin/inquiries?status=pending" className="text-xs text-white/40 hover:text-rose-400 transition-colors flex items-center gap-1 group">
              전체 보기
              <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {pendingInquiries.map((inquiry, idx) => (
              <Link
                key={inquiry.id}
                href={`/admin/inquiries/${inquiry.id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/[0.02] transition-all duration-200 group"
                style={{ animationDelay: `${(idx + 4) * 100}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white/90 truncate group-hover:text-white transition-colors text-sm">
                    {inquiry.subject || inquiry.message.slice(0, 30) + "..."}
                  </div>
                  <div className="text-xs text-white/40 mt-0.5">{inquiry.name} · {inquiry.email}</div>
                </div>
                <svg className="w-5 h-5 text-white/20 group-hover:text-white/40 transition-all group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
            {pendingInquiries.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-white/30">모든 문의가 처리되었습니다!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="animate-fade-in-up animation-delay-400">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-1 h-5 bg-gradient-to-b from-violet-500 to-fuchsia-500 rounded-full" />
          <h3 className="font-semibold text-white">빠른 작업</h3>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <Link
            href="/admin/menus"
            className="glass rounded-2xl p-6 hover-lift glass-hover group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/10">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
            </div>
            <div className="font-medium text-white mb-1">메뉴 관리</div>
            <div className="text-xs text-white/40">사이트 메뉴 구성 관리</div>
          </Link>

          <Link
            href="/admin/contents"
            className="glass rounded-2xl p-6 hover-lift glass-hover group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-cyan-500/10">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="font-medium text-white mb-1">콘텐츠 관리</div>
            <div className="text-xs text-white/40">페이지 콘텐츠 편집</div>
          </Link>

          <Link
            href="/admin/inquiries"
            className="glass rounded-2xl p-6 hover-lift glass-hover group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-pink-500/10">
              <svg className="w-6 h-6 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="font-medium text-white mb-1">문의 관리</div>
            <div className="text-xs text-white/40">고객 문의 확인 및 답변</div>
          </Link>

          <Link
            href="/admin/settings"
            className="glass rounded-2xl p-6 hover-lift glass-hover group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500/20 to-zinc-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="font-medium text-white mb-1">설정</div>
            <div className="text-xs text-white/40">사이트 설정 관리</div>
          </Link>
        </div>
      </div>
    </div>
  );
}
