export type InquiryType = "general" | "project" | "recruit";
export type InquiryStatus = "pending" | "in_progress" | "completed";

export interface Inquiry {
  id: string;
  type: InquiryType;
  status: InquiryStatus;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  fileUrl?: string;
  fileName?: string;
  extra?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export const mockInquiries: Inquiry[] = [
  {
    id: "inq_001",
    type: "project",
    status: "pending",
    name: "김민수",
    email: "minsu.kim@techcorp.co.kr",
    phone: "010-1234-5678",
    subject: "기업 홈페이지 리뉴얼 문의",
    message:
      "안녕하세요. 저희 회사 홈페이지가 5년 정도 되어서 전면 리뉴얼을 검토하고 있습니다. 반응형 웹으로 제작 희망하며, 관리자 페이지도 함께 구축하고 싶습니다. 미팅 가능할까요?",
    extra: {
      company: "(주)테크코프",
      budget: "3000-5000",
      timeline: "2026년 8월 런칭 희망",
    },
    createdAt: "2026-04-17T09:30:00Z",
    updatedAt: "2026-04-17T09:30:00Z",
  },
  {
    id: "inq_002",
    type: "project",
    status: "in_progress",
    name: "이지은",
    email: "jieun@startuplab.io",
    phone: "010-9876-5432",
    subject: "모바일 앱 UI/UX 디자인 의뢰",
    message:
      "헬스케어 관련 모바일 앱을 개발 중인데, UI/UX 디자인 파트를 외주로 진행하고 싶습니다. 와이어프레임은 어느 정도 잡혀있고, Figma 기반으로 작업 가능하신지 궁금합니다.",
    extra: {
      company: "스타트업랩",
      budget: "1000-3000",
      timeline: "2026년 6월 중순",
    },
    fileName: "프로젝트_RFP_v2.pdf",
    createdAt: "2026-04-15T14:20:00Z",
    updatedAt: "2026-04-16T10:00:00Z",
  },
  {
    id: "inq_003",
    type: "general",
    status: "completed",
    name: "박서연",
    email: "seoyeon.park@gmail.com",
    subject: "포트폴리오 관련 질문",
    message:
      "홈페이지에서 본 금융 앱 프로젝트가 인상적이었습니다. 해당 프로젝트의 작업 기간과 투입 인원이 어느 정도였는지 궁금합니다.",
    createdAt: "2026-04-10T11:00:00Z",
    updatedAt: "2026-04-11T09:15:00Z",
  },
  {
    id: "inq_004",
    type: "recruit",
    status: "pending",
    name: "최준혁",
    email: "junhyuk.choi@design.com",
    phone: "010-5555-7777",
    message:
      "3년차 UI 디자이너입니다. Figma, Sketch 능숙하고 디자인 시스템 구축 경험이 있습니다. 포트폴리오와 이력서 첨부드립니다.",
    extra: {
      position: "ui-designer",
      portfolioUrl: "https://junhyuk-portfolio.com",
    },
    fileName: "최준혁_이력서.pdf",
    createdAt: "2026-04-16T16:45:00Z",
    updatedAt: "2026-04-16T16:45:00Z",
  },
  {
    id: "inq_005",
    type: "recruit",
    status: "in_progress",
    name: "정하은",
    email: "haeun.jung@naver.com",
    phone: "010-3333-4444",
    message:
      "프론트엔드 개발자로 지원합니다. React, Next.js, TypeScript 경험 4년이고 현재 프리랜서로 활동 중입니다. 풀타임 전환을 고려하고 있습니다.",
    extra: {
      position: "frontend",
      portfolioUrl: "https://github.com/haeun-dev",
    },
    fileName: "정하은_이력서_포트폴리오.pdf",
    createdAt: "2026-04-14T08:30:00Z",
    updatedAt: "2026-04-15T11:20:00Z",
  },
  {
    id: "inq_006",
    type: "general",
    status: "pending",
    name: "오태영",
    email: "taeyoung.oh@company.kr",
    phone: "010-2222-8888",
    subject: "협업/제휴 문의",
    message:
      "저희는 백엔드 전문 개발사인데, 프론트엔드/디자인 파트너를 찾고 있습니다. 정기적인 협업 관계를 맺을 수 있을지 미팅을 요청드립니다.",
    createdAt: "2026-04-17T07:00:00Z",
    updatedAt: "2026-04-17T07:00:00Z",
  },
  {
    id: "inq_007",
    type: "project",
    status: "pending",
    name: "한소희",
    email: "sohee@eduplatform.com",
    phone: "010-6666-9999",
    subject: "교육 플랫폼 대시보드 디자인",
    message:
      "온라인 교육 플랫폼의 관리자 대시보드 UI를 새로 디자인하려 합니다. 데이터 시각화가 많아서 차트/그래프 디자인 경험이 있으신지 궁금합니다. 기존 디자인 시안 첨부합니다.",
    extra: {
      company: "(주)에듀플랫폼",
      budget: "5000-1억",
      timeline: "2026년 10월",
    },
    fileName: "대시보드_현행_시안.fig",
    createdAt: "2026-04-16T13:10:00Z",
    updatedAt: "2026-04-16T13:10:00Z",
  },
];
