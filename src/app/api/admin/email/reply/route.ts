import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface Attachment {
  filename: string;
  content: string; // base64
}

export async function POST(request: Request) {
  try {
    // 인증 확인
    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const { inquiryId, to, customerName, subject, originalMessage, replyMessage, replySubject, attachments } = await request.json();

    // 필수 필드 검증
    if (!to || !replyMessage) {
      return NextResponse.json(
        { success: false, error: "필수 정보가 누락되었습니다." },
        { status: 400 }
      );
    }

    // 첨부파일 처리
    const emailAttachments = attachments?.map((file: Attachment) => ({
      filename: file.filename,
      content: Buffer.from(file.content, "base64"),
    })) || [];

    // 이메일 제목 결정
    const emailSubject = replySubject || `[답변] ${subject || "문의하신 내용에 대한 답변입니다"}`;

    // 이메일 발송
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || "머스트 엘더트리엔 <noreply@eldertrien.com>",
      to: [to],
      subject: emailSubject,
      html: generateEmailTemplate({
        customerName,
        originalMessage,
        replyMessage,
      }),
      attachments: emailAttachments,
    });

    if (error) {
      console.error("Email send error:", error);
      return NextResponse.json(
        { success: false, error: "이메일 발송에 실패했습니다." },
        { status: 500 }
      );
    }

    // 문의에 답변 정보 저장
    if (inquiryId) {
      await prisma.inquiry.update({
        where: { id: inquiryId },
        data: {
          status: "completed",
          replySubject: emailSubject,
          replyMessage: replyMessage,
          repliedAt: new Date(),
          repliedBy: session.name,
        },
      });
    }

    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error("Email API error:", error);
    return NextResponse.json(
      { success: false, error: "이메일 발송 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// HTML 특수문자 이스케이프 (XSS 방지)
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

function generateEmailTemplate({
  customerName,
  originalMessage,
  replyMessage,
}: {
  customerName?: string;
  originalMessage?: string;
  replyMessage: string;
}) {
  // 모든 사용자 입력값 이스케이프
  const safeCustomerName = customerName ? escapeHtml(customerName) : "";
  const safeOriginalMessage = originalMessage ? escapeHtml(originalMessage) : "";
  const safeReplyMessage = escapeHtml(replyMessage);

  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>문의 답변</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; background-color: #f8fafc;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 32px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">머스트 엘더트리엔</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.8); font-size: 14px;">문의하신 내용에 답변드립니다</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              <!-- Greeting -->
              <p style="margin: 0 0 24px; color: #1e293b; font-size: 16px; line-height: 1.6;">
                안녕하세요${safeCustomerName ? `, <strong>${safeCustomerName}</strong>님` : ""}.<br>
                머스트 엘더트리엔을 이용해 주셔서 감사합니다.
              </p>

              ${safeOriginalMessage ? `
              <!-- Original Message -->
              <div style="margin-bottom: 24px; padding: 20px; background-color: #f1f5f9; border-radius: 12px; border-left: 4px solid #94a3b8;">
                <p style="margin: 0 0 8px; color: #64748b; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">문의 내용</p>
                <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${safeOriginalMessage}</p>
              </div>
              ` : ""}

              <!-- Reply Message -->
              <div style="margin-bottom: 32px; padding: 24px; background-color: #f0f9ff; border-radius: 12px; border-left: 4px solid #667eea;">
                <p style="margin: 0 0 8px; color: #667eea; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">답변</p>
                <p style="margin: 0; color: #1e293b; font-size: 15px; line-height: 1.8; white-space: pre-wrap;">${safeReplyMessage}</p>
              </div>

              <!-- Closing -->
              <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                추가 문의사항이 있으시면 언제든지 연락 주시기 바랍니다.<br>
                감사합니다.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 8px; color: #1e293b; font-size: 14px; font-weight: 600;">머스트 엘더트리엔</p>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                본 메일은 발신 전용입니다.<br>
                &copy; ${new Date().getFullYear()} 머스트 엘더트리엔. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
