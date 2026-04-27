type Partner = {
  src: string;
  alt: string;
  width: number; // design px
  height: number; // design px
  opacity: number; // 0–1
};

const PARTNERS_ROW_1: Partner[] = [
  { src: "/images/partners/01-im-bank.png", alt: "iM 뱅크", width: 126, height: 22, opacity: 0.43 },
  { src: "/images/partners/02-hyundai-marine.png", alt: "현대해상", width: 130, height: 27, opacity: 0.43 },
  { src: "/images/partners/03-mg-saemaul.png", alt: "MG 새마을금고", width: 186, height: 46.741, opacity: 0.49 },
  { src: "/images/partners/04-samsung-life.png", alt: "삼성생명", width: 88, height: 24.801, opacity: 0.62 },
  { src: "/images/partners/05-shinhan-life.png", alt: "신한라이프", width: 138, height: 30, opacity: 0.6 },
  { src: "/images/partners/06-hana-life.png", alt: "하나생명", width: 114, height: 30, opacity: 0.89 },
];

const PARTNERS_ROW_2: Partner[] = [
  { src: "/images/partners/07-hanwha-life.png", alt: "한화생명", width: 146, height: 49.171, opacity: 0.42 },
  { src: "/images/partners/08-db-insurance.png", alt: "DB손해보험", width: 152, height: 46, opacity: 0.7 },
  { src: "/images/partners/09-nice.png", alt: "NICE 평가정보", width: 194, height: 51.216, opacity: 0.48 },
  { src: "/images/partners/10-db-savings.png", alt: "DB저축은행", width: 150, height: 48.729, opacity: 0.74 },
  { src: "/images/partners/11-mirae-asset.png", alt: "미래에셋생명", width: 166, height: 66, opacity: 0.56 },
  { src: "/images/partners/12-kyobo.png", alt: "교보생명", width: 188, height: 94, opacity: 0.78 },
];

const toCqw = (px: number) => `${((px / 1920) * 100).toFixed(3)}cqw`;

function PartnerLogo({ partner }: { partner: Partner }) {
  return (
    <div
      className="flex h-full shrink-0 items-center justify-center"
      style={{ width: "13.646cqw" /* 262 / 1920 */ }}
    >
      <img
        src={partner.src}
        alt={partner.alt}
        className="pointer-events-none select-none"
        style={{
          width: toCqw(partner.width),
          height: toCqw(partner.height),
          opacity: partner.opacity,
          objectFit: "contain",
        }}
      />
    </div>
  );
}

export default function OurPartnersSection() {
  return (
    <section
      data-section-theme="light"
      className="relative flex w-full items-center justify-center overflow-hidden bg-white"
      style={{ height: "100svh" }}
    >
      <div
        className="relative mx-auto"
        style={{
          width: "min(100vw, calc(100svh * 1920 / 1080))",
          height: "min(100svh, calc(100vw * 1080 / 1920))",
          containerType: "size",
        }}
      >
        {/* Banner image — Figma mask shows a 1447×247 slice of an upscaled 1740×1019
         * image; we crop with overflow-hidden and offset the inner img to match. */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: "16.111%",
            left: "12.292%",
            width: "75.365%",
            height: "22.870%",
          }}
        >
          <picture>
            <source srcSet="/images/partners/banner.avif" type="image/avif" />
            <img
              src="/images/partners/banner.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute select-none"
              style={{
                left: "-11.403%",
                top: "-71.255%",
                width: "120.249%",
                height: "412.551%",
                maxWidth: "none",
                objectFit: "fill",
              }}
            />
          </picture>
        </div>

        {/* OUR PARTNERS headline (centered) */}
        <p
          className="absolute uppercase whitespace-nowrap"
          style={{
            top: "46.389%",
            left: "50%",
            transform: "translateX(-50%)",
            color: "black",
            fontFamily: "var(--font-montserrat)",
            fontWeight: 800,
            fontSize: "6.250cqw",
            letterSpacing: "0.1875cqw",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          Our Partners
        </p>

        {/* Logo row 1 (offset left:34, top:715) */}
        <div
          className="absolute flex items-center"
          style={{
            top: "66.204%",
            left: "1.771%",
            height: "4.063cqw",
            gap: "1.563cqw",
          }}
        >
          {PARTNERS_ROW_1.map((p) => (
            <PartnerLogo key={p.src} partner={p} />
          ))}
        </div>

        {/* Logo row 2 (offset right by 132px to create the brick-pattern stagger) */}
        <div
          className="absolute flex items-center"
          style={{
            top: "76.296%",
            left: "8.646%",
            height: "4.063cqw",
            gap: "1.563cqw",
          }}
        >
          {PARTNERS_ROW_2.map((p) => (
            <PartnerLogo key={p.src} partner={p} />
          ))}
        </div>

        {/* Tagline (Montserrat Medium 13px black 50% opacity) */}
        <p
          className="absolute whitespace-nowrap"
          style={{
            top: "94.259%",
            left: "3.125%",
            color: "black",
            opacity: 0.5,
            fontFamily: "var(--font-montserrat)",
            fontWeight: 500,
            fontSize: "0.677cqw",
            lineHeight: 1,
            margin: 0,
          }}
        >
          Growing through diverse collaborations and seeking new partners.
        </p>

        {/* Copyright */}
        <p
          className="absolute whitespace-nowrap"
          style={{
            top: "94.074%",
            left: "89.167%",
            color: "#A9A9A9",
            fontFamily: "'Pretendard', sans-serif",
            fontWeight: 600,
            fontSize: "0.625cqw",
            lineHeight: "normal",
            margin: 0,
          }}
        >
          © 2026 MUST ELDERTREE
        </p>
      </div>
    </section>
  );
}
