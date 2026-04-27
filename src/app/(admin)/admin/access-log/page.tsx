import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession, isSuperAdmin } from "@/lib/admin/auth";
import {
  getActivityLogs,
  getAllLogs,
  getPersonalInfoLogs,
  getEmailLogs,
  PAGE_SIZE,
  type ActivityRow,
  type AllRow,
  type DateRange,
  type EmailRow,
  type PersonalInfoRow,
  type Page,
} from "./actions";

type TabKey = "all" | "activity" | "personal-info" | "email";

const TABS: { key: TabKey; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "activity", label: "관리자 활동" },
  { key: "personal-info", label: "개인정보 접근" },
  { key: "email", label: "메일 발송" },
];

const KIND_LABEL: Record<AllRow["kind"], string> = {
  activity: "활동",
  "personal-info": "개인정보",
  email: "메일",
};

const KIND_BADGE: Record<AllRow["kind"], string> = {
  activity: "bg-violet-50 text-violet-700 border-violet-200",
  "personal-info": "bg-sky-50 text-sky-700 border-sky-200",
  email: "bg-amber-50 text-amber-700 border-amber-200",
};

interface Props {
  searchParams: Promise<{
    tab?: string;
    page?: string;
    from?: string;
    to?: string;
  }>;
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

/** Parse "YYYY-MM-DD" as the start (00:00) of that day in KST. Returns Date in UTC. */
function parseKstStart(dateStr: string | undefined): Date | undefined {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return undefined;
  const d = new Date(`${dateStr}T00:00:00.000+09:00`);
  return isNaN(d.getTime()) ? undefined : d;
}

/** Parse "YYYY-MM-DD" as end-of-day (23:59:59.999) in KST. Returns Date in UTC. */
function parseKstEnd(dateStr: string | undefined): Date | undefined {
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return undefined;
  const d = new Date(`${dateStr}T23:59:59.999+09:00`);
  return isNaN(d.getTime()) ? undefined : d;
}

function buildHref(tab: TabKey, opts: { page?: number; from?: string; to?: string }): string {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (opts.page && opts.page > 1) params.set("page", String(opts.page));
  if (opts.from) params.set("from", opts.from);
  if (opts.to) params.set("to", opts.to);
  return `/admin/access-log?${params.toString()}`;
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

function FilterBar({
  tab,
  from,
  to,
}: {
  tab: TabKey;
  from?: string;
  to?: string;
}) {
  const hasFilter = Boolean(from || to);
  return (
    <form
      action="/admin/access-log"
      method="get"
      className="flex flex-wrap items-center gap-2 mb-4 px-1"
    >
      <input type="hidden" name="tab" value={tab} />
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <span className="text-xs font-medium text-slate-500">시작</span>
        <input
          type="date"
          name="from"
          defaultValue={from ?? ""}
          className="px-2 py-1.5 rounded-md border border-slate-200 text-sm font-mono"
        />
      </label>
      <span className="text-slate-300">–</span>
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <span className="text-xs font-medium text-slate-500">종료</span>
        <input
          type="date"
          name="to"
          defaultValue={to ?? ""}
          className="px-2 py-1.5 rounded-md border border-slate-200 text-sm font-mono"
        />
      </label>
      <button
        type="submit"
        className="px-4 py-1.5 rounded-md bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
      >
        검색
      </button>
      {hasFilter && (
        <Link
          href={buildHref(tab, {})}
          className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
        >
          초기화
        </Link>
      )}
    </form>
  );
}

function Pagination({
  tab,
  page,
  total,
  from,
  to,
}: {
  tab: TabKey;
  page: number;
  total: number;
  from?: string;
  to?: string;
}) {
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
            href={buildHref(tab, { page: prev, from, to })}
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
            href={buildHref(tab, { page: next, from, to })}
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

function AllTable({
  data,
  tab,
  from,
  to,
}: {
  data: Page<AllRow>;
  tab: TabKey;
  from?: string;
  to?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 text-left font-medium">시간</th>
              <th className="px-6 py-3 text-left font-medium">종류</th>
              <th className="px-6 py-3 text-left font-medium">동작/상태</th>
              <th className="px-6 py-3 text-left font-medium">관리자</th>
              <th className="px-6 py-3 text-left font-medium">상세</th>
              <th className="px-6 py-3 text-left font-medium">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                  기록이 없습니다.
                </td>
              </tr>
            )}
            {data.rows.map((row) => (
              <tr key={`${row.kind}-${row.id}`} className="hover:bg-slate-50/50">
                <td className="px-6 py-3 text-slate-600 whitespace-nowrap font-mono text-xs">{formatDate(row.createdAt)}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded border text-xs font-medium ${KIND_BADGE[row.kind]}`}>
                    {KIND_LABEL[row.kind]}
                  </span>
                </td>
                <td className="px-6 py-3"><ActionBadge action={row.action} /></td>
                <td className="px-6 py-3 text-slate-700">{row.adminName ?? "—"}</td>
                <td className="px-6 py-3 text-slate-600 max-w-md truncate" title={row.detail}>
                  {row.kind !== "activity" && row.resourceId ? (
                    <Link href={`/admin/inquiries/${row.resourceId}`} className="text-violet-600 hover:underline">
                      {row.detail}
                    </Link>
                  ) : (
                    row.detail || "—"
                  )}
                </td>
                <td className="px-6 py-3 text-slate-600 font-mono text-xs">{row.ipAddress ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination tab={tab} page={data.page} total={data.total} from={from} to={to} />
    </div>
  );
}

function ActivityTable({ data, from, to }: { data: Page<ActivityRow>; from?: string; to?: string }) {
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
      <Pagination tab="activity" page={data.page} total={data.total} from={from} to={to} />
    </div>
  );
}

function PersonalInfoTable({ data, from, to }: { data: Page<PersonalInfoRow>; from?: string; to?: string }) {
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
      <Pagination tab="personal-info" page={data.page} total={data.total} from={from} to={to} />
    </div>
  );
}

function EmailTable({ data, from, to }: { data: Page<EmailRow>; from?: string; to?: string }) {
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
      <Pagination tab="email" page={data.page} total={data.total} from={from} to={to} />
    </div>
  );
}

function isTab(value: string | undefined): value is TabKey {
  return value === "all" || value === "activity" || value === "personal-info" || value === "email";
}

export default async function AccessLogPage({ searchParams }: Props) {
  const session = await getSession();
  if (!session || !isSuperAdmin(session)) {
    redirect("/admin");
  }

  const sp = await searchParams;
  const tab: TabKey = isTab(sp.tab) ? sp.tab : "all";
  const page = sp.page ? Math.max(1, parseInt(sp.page, 10) || 1) : 1;
  const fromStr = sp.from && /^\d{4}-\d{2}-\d{2}$/.test(sp.from) ? sp.from : undefined;
  const toStr = sp.to && /^\d{4}-\d{2}-\d{2}$/.test(sp.to) ? sp.to : undefined;

  const range: DateRange = {
    from: parseKstStart(fromStr),
    to: parseKstEnd(toStr),
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">접근로그</h1>
            <p className="text-sm text-slate-500">관리자 활동, 개인정보 접근, 메일 발송 기록을 확인합니다 (최대 1년 보관, 한국 시간 표시)</p>
          </div>
        </div>
      </header>

      <div className="p-8">
        {/* Tabs */}
        <div className="mb-4 border-b border-slate-200">
          <nav className="flex gap-1">
            {TABS.map((t) => {
              const active = t.key === tab;
              return (
                <Link
                  key={t.key}
                  href={buildHref(t.key, { from: fromStr, to: toStr })}
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

        {/* Date filter */}
        <FilterBar tab={tab} from={fromStr} to={toStr} />

        {tab === "all" && (
          <AllTable data={await getAllLogs(page, range)} tab={tab} from={fromStr} to={toStr} />
        )}
        {tab === "activity" && (
          <ActivityTable data={await getActivityLogs(page, range)} from={fromStr} to={toStr} />
        )}
        {tab === "personal-info" && (
          <PersonalInfoTable data={await getPersonalInfoLogs(page, range)} from={fromStr} to={toStr} />
        )}
        {tab === "email" && (
          <EmailTable data={await getEmailLogs(page, range)} from={fromStr} to={toStr} />
        )}
      </div>
    </div>
  );
}
