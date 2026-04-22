"use client";

import { useState, useTransition } from "react";
import { type Settings, updateSettings } from "./actions";

interface Props {
  initialSettings: Settings;
}

function SettingSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  helpText,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  helpText?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
      />
      {helpText && <p className="text-xs text-slate-500 mt-1">{helpText}</p>}
    </div>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
      />
    </div>
  );
}

function ImageUpload({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
          {value ? (
            <div className="text-xs text-slate-500 text-center p-2 break-all">
              {value.split("/").pop()}
            </div>
          ) : (
            <svg
              className="w-8 h-8 text-slate-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          )}
        </div>
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="이미지 URL 입력"
            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          <button className="mt-2 text-sm text-slate-600 hover:text-slate-900 font-medium">
            파일 업로드
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsClient({ initialSettings }: Props) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<
    "general" | "contact" | "seo" | "social"
  >("general");
  const [saved, setSaved] = useState(false);

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    startTransition(async () => {
      const { id, createdAt, updatedAt, ...data } = settings;
      await updateSettings(data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const tabs = [
    {
      id: "general",
      label: "기본 정보",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      ),
    },
    {
      id: "contact",
      label: "연락처",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
      ),
    },
    {
      id: "social",
      label: "소셜 미디어",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
      ),
    },
    {
      id: "seo",
      label: "SEO 설정",
      icon: (
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-900">설정</h1>
          <div className="flex items-center gap-3">
            {isPending && (
              <span className="text-sm text-slate-500">저장 중...</span>
            )}
            <button
              onClick={handleSave}
              disabled={isPending}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-50 ${
                saved
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-800"
              }`}
            >
              {saved ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  저장 완료
                </span>
              ) : (
                "변경사항 저장"
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="p-8">
        <div className="max-w-4xl">
          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-slate-100 p-1 rounded-xl">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === "general" && (
              <>
                <SettingSection
                  title="사이트 정보"
                  description="웹사이트의 기본 정보를 설정합니다"
                >
                  <div className="space-y-5">
                    <InputField
                      label="사이트 이름"
                      value={settings.siteName}
                      onChange={(v) => updateSetting("siteName", v)}
                      placeholder="회사명 또는 사이트명"
                    />
                    <TextareaField
                      label="사이트 설명"
                      value={settings.siteDescription}
                      onChange={(v) => updateSetting("siteDescription", v)}
                      placeholder="사이트에 대한 간단한 설명"
                      rows={2}
                    />
                  </div>
                </SettingSection>

                <SettingSection
                  title="브랜드 이미지"
                  description="로고와 파비콘을 설정합니다"
                >
                  <div className="space-y-5">
                    <ImageUpload
                      label="로고"
                      value={settings.logoUrl}
                      onChange={(v) => updateSetting("logoUrl", v)}
                    />
                    <ImageUpload
                      label="파비콘"
                      value={settings.faviconUrl}
                      onChange={(v) => updateSetting("faviconUrl", v)}
                    />
                  </div>
                </SettingSection>

                <SettingSection
                  title="푸터"
                  description="사이트 하단에 표시될 내용입니다"
                >
                  <InputField
                    label="푸터 텍스트"
                    value={settings.footerText}
                    onChange={(v) => updateSetting("footerText", v)}
                    placeholder="© 2024 회사명. All rights reserved."
                  />
                </SettingSection>
              </>
            )}

            {activeTab === "contact" && (
              <>
                <SettingSection
                  title="연락처 정보"
                  description="고객이 연락할 수 있는 정보를 설정합니다"
                >
                  <div className="space-y-5">
                    <InputField
                      label="주소"
                      value={settings.address}
                      onChange={(v) => updateSetting("address", v)}
                      placeholder="회사 주소"
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <InputField
                        label="전화번호"
                        value={settings.phone}
                        onChange={(v) => updateSetting("phone", v)}
                        placeholder="02-1234-5678"
                        type="tel"
                      />
                      <InputField
                        label="이메일"
                        value={settings.email}
                        onChange={(v) => updateSetting("email", v)}
                        placeholder="contact@example.com"
                        type="email"
                      />
                    </div>
                    <InputField
                      label="영업시간"
                      value={settings.businessHours}
                      onChange={(v) => updateSetting("businessHours", v)}
                      placeholder="평일 09:00 - 18:00"
                    />
                  </div>
                </SettingSection>
              </>
            )}

            {activeTab === "social" && (
              <>
                <SettingSection
                  title="소셜 미디어 링크"
                  description="SNS 계정 링크를 설정합니다"
                >
                  <div className="space-y-5">
                    <InputField
                      label="Instagram"
                      value={settings.instagram}
                      onChange={(v) => updateSetting("instagram", v)}
                      placeholder="https://instagram.com/username"
                    />
                    <InputField
                      label="Facebook"
                      value={settings.facebook}
                      onChange={(v) => updateSetting("facebook", v)}
                      placeholder="https://facebook.com/username"
                    />
                    <InputField
                      label="YouTube"
                      value={settings.youtube}
                      onChange={(v) => updateSetting("youtube", v)}
                      placeholder="https://youtube.com/@channel"
                    />
                    <InputField
                      label="블로그"
                      value={settings.blog}
                      onChange={(v) => updateSetting("blog", v)}
                      placeholder="https://blog.naver.com/username"
                    />
                  </div>
                </SettingSection>
              </>
            )}

            {activeTab === "seo" && (
              <>
                <SettingSection
                  title="메타 태그"
                  description="검색 엔진 최적화를 위한 메타 정보입니다"
                >
                  <div className="space-y-5">
                    <InputField
                      label="메타 타이틀"
                      value={settings.metaTitle}
                      onChange={(v) => updateSetting("metaTitle", v)}
                      placeholder="페이지 제목 | 회사명"
                      helpText="검색 결과에 표시되는 제목입니다. 60자 이내를 권장합니다."
                    />
                    <TextareaField
                      label="메타 설명"
                      value={settings.metaDescription}
                      onChange={(v) => updateSetting("metaDescription", v)}
                      placeholder="사이트에 대한 설명"
                      rows={2}
                    />
                    <InputField
                      label="메타 키워드"
                      value={settings.metaKeywords}
                      onChange={(v) => updateSetting("metaKeywords", v)}
                      placeholder="키워드1, 키워드2, 키워드3"
                      helpText="쉼표로 구분하여 입력하세요"
                    />
                  </div>
                </SettingSection>

                <SettingSection
                  title="분석 도구"
                  description="사이트 분석을 위한 설정입니다"
                >
                  <InputField
                    label="Google Analytics ID"
                    value={settings.googleAnalyticsId}
                    onChange={(v) => updateSetting("googleAnalyticsId", v)}
                    placeholder="G-XXXXXXXXXX"
                    helpText="Google Analytics 4 측정 ID를 입력하세요"
                  />
                </SettingSection>

                {/* Preview */}
                <SettingSection
                  title="검색 결과 미리보기"
                  description="Google 검색 결과에 표시되는 모습입니다"
                >
                  <div className="p-4 bg-slate-50 rounded-lg">
                    <div className="text-blue-700 text-lg hover:underline cursor-pointer">
                      {settings.metaTitle || "페이지 제목"}
                    </div>
                    <div className="text-green-700 text-sm mt-1">
                      https://eldertrien.com
                    </div>
                    <div className="text-slate-600 text-sm mt-1 line-clamp-2">
                      {settings.metaDescription ||
                        "페이지 설명이 여기에 표시됩니다..."}
                    </div>
                  </div>
                </SettingSection>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
