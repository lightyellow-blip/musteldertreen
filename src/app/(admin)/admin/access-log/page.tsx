import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isSuperAdmin } from "@/lib/admin/auth";
import {
  getActivityLogs,
  getPersonalInfoLogs,
  getEmailLogs,
  PAGE_SIZE,
  type ActivityRow,
  type EmailRow,
  type PersonalInfoRow,
  type Page,
} from "./actions";

type TabKey = "activity" | "personal-info" | "email";

const TABS: { key: TabKey; label: string }[] = [
  { key: "activity", label: "관리자 활동" },
  { key: "personal-info", label: "개인정보 접근" },
  { key: "email", label: "메일 발송" },
];

interface Props {
  searchParams: Promise<{ tab?: string; page?: string }>;
}

// Render in KST (Asia/Seoul) regardless of the runtime's timezone — Vercel
// servers run in UTC, so without an explicit timeZone the rows would all be
// displayed 9 hours behind local time.
const KST_FORMATTER = new Intl.DateTimeFormat("ko-KR", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function formatDate(date: Date) {
  const parts = KST_FORMATTER.formatToParts(new Date(date));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}.${get("month")}.${get("day")} ${get("hour")}:${get("minute")}:${get("second")}`;
}

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    LOGIN: "bg-emerald-50 text-emerald-700 border-emerald-200",
    LOGOUT: "bg-slate-50 text-slate-700 border-slate-200",
    LOGIN_FAILED: "bg-red-50 text-red-700 border-red-200",
    SENT: "bg-emerald-50 text-emerald-700 border-emerald-200",
    FAILED: "bg-red-50 text-red-700 border-red-200",
    VIEW: "bg-sky-50 text-sky-700 border-sky-200",
  };
  const cls = styles[action] ?? "bg-slate-50 text-slate-700 border-slate-200";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${cls}`}>
      {action}
    </span>
  );
}

function Pagination({ tab, page, total }: { tab: TabKey; page: number; total: number }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const start = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const end = Math.min(page * PAGE_SIZE, total);

  return (
    <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 text-sm text-slate-600">
      <div>
        {total === 0 ? "기록 없음" : `${start.toLocaleString()}–${end.toLocaleString()} / ${total.toLocaleString()}`}
      </div>
      <div className="flex items-center gap-2">
        {prev ? (
          <Link
            href={`/admin/access-log?tab=${tab}&page=${prev}`}
            className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            이전
          </Link>
        ) : (
          <span className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-300 cursor-not-allowed">이전</span>
        )}
        <span className="px-2 text-slate-500">
          {page} / {totalPages}
        </span>
        {next ? (
          <Link
            href={`/admin/access-log?tab=${tab}&page=${next}`}
            className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            다음
          </Link>
        ) : (
          <span className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-300 cursor-not-allowed">다음</span>
        )}
      </div>
    </div>
  );
}

function ActivityTable({ data }: { data: Page<ActivityRow> }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">시간</th>
              <th className="px-6 py-3 text-left font-medium">동작</th>
              <th className="px-6 py-3 text-left font-medium">관리자</th>
              <th className="px-6 py-3 text-left font-medium">IP</th>
              <th className="px-6 py-3 text-left font-medium">User Agent</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  기록이 없습니다.
                </td>
              </tr>
            )}
            {data.rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-3 text-slate-600 whitespace-nowrap font-mono text-xs">{formatDate(row.createdAt)}</td>
                <td className="px-6 py-3"><ActionBadge action={row.action} /></td>
                <td className="px-6 py-3 text-slate-700">
                  {row.adminName ? (
                    <div>
                      <div className="font-medium">{row.adminName}</div>
                      <div className="text-xs text-slate-400">{row.adminEmail}</div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-xs">{row.adminEmail ?? "—"}</div>
                  )}
                </td>
                <td className="px-6 py-3 text-slate-600 font-mono text-xs">{row.ipAddress ?? "—"}</td>
                <td className="px-6 py-3 text-slate-500 text-xs max-w-md truncate" title={row.userAgent ?? ""}>
                  {row.userAgent ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination tab="activity" page={data.page} total={data.total} />
    </div>
  );
}

function PersonalInfoTable({ data }: { data: Page<PersonalInfoRow> }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">시간</th>
              <th className="px-6 py-3 text-left font-medium">동작</th>
              <th className="px-6 py-3 text-left font-medium">관리자</th>
              <th className="px-6 py-3 text-left font-medium">리소스</th>
              <th className="px-6 py-3 text-left font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  기록이 없습니다.
                </td>
              </tr>
            )}
            {data.rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-3 text-slate-600 whitespace-nowrap font-mono text-xs">{formatDate(row.createdAt)}</td>
                <td className="px-6 py-3"><ActionBadge action={row.action} /></td>
                <td className="px-6 py-3 text-slate-700 font-medium">{row.adminName}</td>
                <td className="px-6 py-3 text-slate-700">
                  {row.resource === "inquiry" ? (
                    <Link href={`/admin/inquiries/${row.resourceId}`} className="text-violet-600 hover:underline">
                      문의 #{row.resourceId.slice(0, 8)}
                    </Link>
                  ) : (
                    <span className="font-mono text-xs">{row.resource}/{row.resourceId}</span>
                  )}
                </td>
                <td className="px-6 py-3 text-slate-600 font-mono text-xs">{row.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination tab="personal-info" page={data.page} total={data.total} />
    </div>
  );
}

function EmailTable({ data }: { data: Page<EmailRow> }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">시간</th>
              <th className="px-6 py-3 text-left font-medium">상태</th>
              <th className="px-6 py-3 text-left font-medium">유형</th>
              <th className="px-6 py-3 text-left font-medium">수신자</th>
              <th className="px-6 py-3 text-left font-medium">제목</th>
              <th className="px-6 py-3 text-left font-medium">발송자</th>
              <th className="px-6 py-3 text-left font-medium">관련</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  기록이 없습니다.
                </td>
              </tr>
            )}
            {data.rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-50/50">
                <td className="px-6 py-3 text-slate-600 whitespace-nowrap font-mono text-xs">{formatDate(row.createdAt)}</td>
                <td className="px-6 py-3"><ActionBadge action={row.status} /></td>
                <td className="px-6 py-3 text-slate-600 text-xs">{row.type}</td>
                <td className="px-6 py-3 text-slate-700">{row.toEmail}</td>
                <td className="px-6 py-3 text-slate-600 max-w-xs truncate" title={row.subject}>{row.subject}</td>
                <td className="px-6 py-3 text-slate-700">{row.sentByName ?? "—"}</td>
                <td className="px-6 py-3 text-slate-600 text-xs">
                  {row.resourceId ? (
                    <Link href={`/admin/inquiries/${row.resourceId}`} className="text-violet-600 hover:underline font-mono">
                      #{row.resourceId.slice(0, 8)}
                    </Link>
                  ) : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination tab="email" page={data.page} total={data.total} />
    </div>
  );
}

function isTab(value: string | undefined): value is TabKey {
  return value === "activity" || value === "personal-info" || value === "email";
}

export default async function AccessLogPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session || !isSuperAdmin(session)) {
    redirect("/admin");
  }

  const sp = await searchParams;
  const tab: TabKey = isTab(sp.tab) ? sp.tab : "activity";
  const page = sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">접근로그</h1>
            <p className="text-sm text-slate-500">관리자 활동, 개인정보 접근, 메일 발송 기록을 확인합니다 (최대 1년 보관)</p>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Tabs */}
        <div className="mb-6 border-b border-slate-200">
          <nav className="flex gap-1">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <Link
                  key={t.key}
                  href={`/admin/access-log?tab=${t.key}`}
                  className={
                    "px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors " +
                    (active
                      ? "border-violet-500 text-violet-700"
                      : "border-transparent text-slate-500 hover:text-slate-700")
                  }
                >
                  {t.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {tab === "activity" && <ActivityTable data={await getActivityLogs(page)} />}
        {tab === "personal-info" && <PersonalInfoTable data={await getPersonalInfoLogs(page)} />}
        {tab === "email" && <EmailTable data={await getEmailLogs(page)} />}
      </div>
    </div>
  );
}
