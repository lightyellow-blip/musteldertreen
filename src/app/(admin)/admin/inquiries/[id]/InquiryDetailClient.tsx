"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { type Inquiry, type InquiryStatus, updateInquiryStatus, deleteInquiry } from "../actions";

type EmailStatus = "idle" | "sending" | "success" | "error";

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
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
  inquiry: Inquiry;
}

export default function InquiryDetailClient({ inquiry }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<InquiryStatus>(inquiry.status);

  // 이메일 답변 관련 상태
  const defaultSubject = `[답변] ${inquiry.subject || "문의하신 내용에 대한 답변입니다"}`;
  const [replySubject, setReplySubject] = useState(defaultSubject);
  const [replyMessage, setReplyMessage] = useState("");
  const [emailStatus, setEmailStatus] = useState<EmailStatus>("idle");
  const [emailError, setEmailError] = useState("");
  const [attachments, setAttachments] = useState<{ filename: string; content: string; size: number }[]>([]);

  async function handleStatusChange(newStatus: InquiryStatus) {
    setStatus(newStatus);
    startTransition(async () => {
      await updateInquiryStatus(inquiry.id, newStatus);
    });
  }

  async function handleDelete() {
    if (!confirm("이 문의를 삭제하시겠습니까?")) return;
    startTransition(async () => {
      await deleteInquiry(inquiry.id);
      router.push("/admin/inquiries");
    });
  }

  // 파일 업로드 핸들러
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    const newAttachments: { filename: string; content: string; size: number }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > maxSize) {
        setEmailError(`${file.name}: 파일 크기가 10MB를 초과합니다.`);
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]); // data:...;base64, 제거
        };
        reader.readAsDataURL(file);
      });

      newAttachments.push({
        filename: file.name,
        content: base64,
        size: file.size,
      });
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = ""; // 같은 파일 다시 선택 가능하도록
  }

  function removeAttachment(index: number) {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }

  function formatFileSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  async function handleSendReply() {
    if (!replyMessage.trim()) {
      setEmailError("답변 내용을 입력해주세요.");
      return;
    }

    setEmailStatus("sending");
    setEmailError("");

    try {
      const res = await fetch("/api/admin/email/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inquiryId: inquiry.id,
          to: inquiry.email,
          customerName: inquiry.name,
          subject: inquiry.subject,
          originalMessage: inquiry.message,
          replySubject: replySubject.trim(),
          replyMessage: replyMessage.trim(),
          attachments: attachments.map(({ filename, content }) => ({ filename, content })),
        }),
      });

      const data = await res.json();

      if (data.success) {
        setEmailStatus("success");
        setStatus("completed");
        // 페이지 새로고침으로 답변 이력 표시
        router.refresh();
      } else {
        setEmailStatus("error");
        setEmailError(data.error || "이메일 발송에 실패했습니다.");
      }
    } catch {
      setEmailStatus("error");
      setEmailError("이메일 발송 중 오류가 발생했습니다.");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/inquiries" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              목록
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-semibold text-slate-900">문의 상세</h1>
          </div>
          {isPending && <div className="text-sm text-slate-500">저장 중...</div>}
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-5xl">
          {/* Title Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[status].bg} ${STATUS_CONFIG[status].text} ${STATUS_CONFIG[status].border}`}>
                    {STATUS_CONFIG[status].label}
                  </span>
                </div>
                <h1 className="text-xl font-bold text-slate-900">
                  {inquiry.subject || inquiry.message.slice(0, 50)}
                </h1>
              </div>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as InquiryStatus)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent cursor-pointer"
              >
                <option value="pending">대기</option>
                <option value="in_progress">처리중</option>
                <option value="completed">완료</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Info */}
            <div className="col-span-2 space-y-6">
              {/* Message */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">문의 내용</h2>
                </div>
                <div className="p-6">
                  <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">
                    {inquiry.message}
                  </div>
                </div>
              </div>

              {/* 답변 이력 */}
              {inquiry.repliedAt && (
                <div className="bg-white rounded-xl border border-emerald-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-sm font-semibold text-emerald-900">답변 완료</h2>
                      </div>
                      <div className="text-xs text-emerald-600">
                        {formatDate(inquiry.repliedAt)} · {inquiry.repliedBy}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    {inquiry.replySubject && (
                      <div className="mb-3 pb-3 border-b border-slate-100">
                        <span className="text-xs text-slate-500">제목: </span>
                        <span className="text-sm font-medium text-slate-700">{inquiry.replySubject}</span>
                      </div>
                    )}
                    <div className="prose prose-slate prose-sm max-w-none whitespace-pre-wrap leading-relaxed text-slate-700">
                      {inquiry.replyMessage}
                    </div>
                  </div>
                </div>
              )}

              {/* File */}
              {inquiry.fileName && (
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">첨부파일</h2>
                  </div>
                  <div className="p-6">
                    <div className="inline-flex items-center gap-3 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <span className="text-sm font-medium text-slate-700">{inquiry.fileName}</span>
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    </div>
                  </div>
                </div>
              )}

              {/* Reply Form */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-purple-50">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h2 className="text-sm font-semibold text-violet-900">이메일 답변 발송</h2>
                  </div>
                  <p className="text-xs text-violet-600/70 mt-1">답변을 작성하고 고객에게 이메일로 발송합니다.</p>
                </div>
                <div className="p-6">
                  {emailStatus === "success" ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">이메일 발송 완료</h3>
                      <p className="text-sm text-slate-500 mb-4">
                        {inquiry.email}로 답변이 발송되었습니다.
                      </p>
                      <button
                        onClick={() => {
                          setEmailStatus("idle");
                          setReplyMessage("");
                          setAttachments([]);
                        }}
                        className="text-sm text-violet-600 hover:text-violet-700 font-medium"
                      >
                        새 답변 작성하기
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-500">받는 사람</span>
                          <span className="text-xs text-slate-400">|</span>
                          <span className="text-sm text-slate-700">{inquiry.name} &lt;{inquiry.email}&gt;</span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-500 mb-1.5">제목</label>
                          <input
                            type="text"
                            value={replySubject}
                            onChange={(e) => setReplySubject(e.target.value)}
                            disabled={emailStatus === "sending"}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-slate-50 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>
                      <textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="답변 내용을 입력하세요..."
                        rows={6}
                        disabled={emailStatus === "sending"}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none disabled:bg-slate-50 disabled:cursor-not-allowed"
                      />

                      {/* 첨부파일 */}
                      <div className="mt-4">
                        <div className="flex items-center gap-3 mb-3">
                          <label className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            파일 첨부
                            <input
                              type="file"
                              multiple
                              onChange={handleFileUpload}
                              disabled={emailStatus === "sending"}
                              className="hidden"
                            />
                          </label>
                          <span className="text-xs text-slate-400">최대 10MB, 여러 파일 선택 가능</span>
                        </div>

                        {/* 첨부파일 목록 */}
                        {attachments.length > 0 && (
                          <div className="space-y-2">
                            {attachments.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <span className="text-sm text-slate-700">{file.filename}</span>
                                  <span className="text-xs text-slate-400">({formatFileSize(file.size)})</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeAttachment(index)}
                                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {emailError && (
                        <div className="mt-3 flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {emailError}
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-xs text-slate-400">
                          발송 시 문의 상태가 &apos;완료&apos;로 변경됩니다.
                        </p>
                        <button
                          onClick={handleSendReply}
                          disabled={emailStatus === "sending" || !replyMessage.trim()}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed"
                        >
                          {emailStatus === "sending" ? (
                            <>
                              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              발송 중...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                              이메일 발송
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Contact Info */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">연락처 정보</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">이름</div>
                    <div className="font-medium text-slate-900">{inquiry.name}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">이메일</div>
                    <a href={`mailto:${inquiry.email}`} className="text-sm text-blue-600 hover:underline">
                      {inquiry.email}
                    </a>
                  </div>
                  {inquiry.phone && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">전화번호</div>
                      <div className="text-sm text-slate-900">{inquiry.phone}</div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">일정 정보</h2>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">접수일</div>
                    <div className="text-sm text-slate-900">{formatDate(inquiry.createdAt)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">최종 수정</div>
                    <div className="text-sm text-slate-900">{formatDate(inquiry.updatedAt)}</div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push("/admin/inquiries")}
                  className="w-full px-4 py-2.5 border border-slate-200 bg-white text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  목록으로
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isPending}
                  className="w-full px-4 py-2.5 border border-red-200 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
