"use client";

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen bg-slate-50 relative z-10">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 h-16 flex items-center">
          <h1 className="text-lg font-semibold text-slate-900">접속통계</h1>
        </div>
      </header>

      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">접속통계 연동 예정</h2>
          <p className="text-slate-500 text-center max-w-md">
            실제 방문자 데이터와 연동하여<br />
            통계 정보를 제공할 예정입니다.
          </p>
        </div>
      </div>
    </div>
  );
}
