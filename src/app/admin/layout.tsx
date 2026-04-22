import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { checkIpWhitelist } from "@/lib/ip-check";
import AdminSidebar from "./AdminSidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // IP 화이트리스트 체크
  const { allowed, clientIp } = await checkIpWhitelist();

  if (!allowed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">접근이 차단되었습니다</h1>
          <p className="text-slate-600 mb-4">
            허용되지 않은 IP 주소에서의 접근입니다.
          </p>
          <p className="text-xs text-slate-400 font-mono bg-slate-100 px-3 py-2 rounded-lg">
            접속 IP: {clientIp}
          </p>
          <p className="text-xs text-slate-500 mt-4">
            관리자에게 문의하세요.
          </p>
        </div>
      </div>
    );
  }

  const session = await getSession();

  // 로그인 페이지는 인증 체크 제외
  // layout에서는 children의 경로를 알 수 없으므로, 미들웨어나 페이지에서 처리

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="admin-theme min-h-screen animated-bg flex relative overflow-hidden">
      {/* Background Orbs */}
      <div className="orb orb-violet w-[600px] h-[600px] -top-48 -right-48 fixed z-0" />
      <div className="orb orb-cyan w-[400px] h-[400px] top-1/2 -left-32 fixed z-0" />
      <div className="orb orb-rose w-[300px] h-[300px] bottom-0 right-1/4 fixed z-0" />

      {/* Sidebar */}
      <AdminSidebar session={session} />

      {/* Main Content */}
      <main className="flex-1 ml-72 relative z-10 h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
