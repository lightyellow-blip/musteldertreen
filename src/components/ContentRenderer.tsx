/* eslint-disable @typescript-eslint/no-explicit-any */

interface Content {
  id: string;
  type: string;
  title: string;
  data: any;
  order: number;
}

interface Section {
  id: string;
  name: string;
  order: number;
  contents: Content[];
}

interface Props {
  sections: Section[];
}

// 데이터를 Record로 변환하는 헬퍼
function asRecord(data: any): Record<string, unknown> {
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data as Record<string, unknown>;
  }
  return {};
}

// 텍스트 콘텐츠 렌더링
function TextContent({ data }: { data: any }) {
  const d = asRecord(data);
  const text = (d.text as string) || "";
  return (
    <div
      className="prose prose-lg max-w-none"
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
}

// 이미지 콘텐츠 렌더링
function ImageContent({
  data,
  title,
}: {
  data: any;
  title: string;
}) {
  const d = asRecord(data);
  const url = (d.url as string) || "";
  const alt = (d.alt as string) || title;
  const caption = (d.caption as string) || "";

  if (!url) return null;

  return (
    <figure>
      <img src={url} alt={alt} className="w-full h-auto rounded-lg" />
      {caption && (
        <figcaption className="text-center text-gray-500 mt-2 text-sm">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

// 비디오 콘텐츠 렌더링 (YouTube/Vimeo)
function VideoContent({ data }: { data: any }) {
  const d = asRecord(data);
  const url = (d.url as string) || "";

  if (!url) return null;

  // YouTube URL 파싱
  const youtubeMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  );
  if (youtubeMatch) {
    return (
      <div className="aspect-video">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
          className="w-full h-full rounded-lg"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Vimeo URL 파싱
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return (
      <div className="aspect-video">
        <iframe
          src={`https://player.vimeo.com/video/${vimeoMatch[1]}`}
          className="w-full h-full rounded-lg"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // 직접 비디오 URL
  return (
    <video src={url} controls className="w-full rounded-lg">
      동영상을 재생할 수 없습니다.
    </video>
  );
}

// 갤러리 콘텐츠 렌더링
function GalleryContent({ data }: { data: any }) {
  const d = asRecord(data);
  const images = (d.images as Array<{ url: string; alt?: string }>) || [];

  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image, index) => (
        <img
          key={index}
          src={image.url}
          alt={image.alt || `갤러리 이미지 ${index + 1}`}
          className="w-full h-48 object-cover rounded-lg"
        />
      ))}
    </div>
  );
}

// 단일 콘텐츠 렌더링
function ContentBlock({ content }: { content: Content }) {
  switch (content.type) {
    case "text":
      return <TextContent data={content.data} />;
    case "image":
      return <ImageContent data={content.data} title={content.title} />;
    case "video":
      return <VideoContent data={content.data} />;
    case "gallery":
      return <GalleryContent data={content.data} />;
    default:
      return null;
  }
}

// 섹션 렌더링
function SectionBlock({ section }: { section: Section }) {
  if (section.contents.length === 0) return null;

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {section.name && (
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {section.name}
          </h2>
        )}
        <div className="space-y-8">
          {section.contents.map((content) => (
            <ContentBlock key={content.id} content={content} />
          ))}
        </div>
      </div>
    </section>
  );
}

// 전체 콘텐츠 렌더러
export default function ContentRenderer({ sections }: Props) {
  if (!sections || sections.length === 0) {
    return (
      <div className="py-16 text-center text-gray-500">
        콘텐츠가 아직 등록되지 않았습니다.
      </div>
    );
  }

  return (
    <div>
      {sections.map((section) => (
        <SectionBlock key={section.id} section={section} />
      ))}
    </div>
  );
}
