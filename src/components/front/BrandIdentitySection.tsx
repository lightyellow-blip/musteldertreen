const MARQUEE_ITEMS = ["Brand Identity", "The equation", "What we do"] as const;

const marqueeItemStyle = {
  color: "white",
  fontFamily: "var(--font-montserrat)",
  fontWeight: 700,
  fontSize: "1.875cqw",
  letterSpacing: "0.05625cqw",
  lineHeight: 1.2,
  paddingRight: "6.25cqw",
} as const;

const headlineStyle = {
  top: "39.907%",
  color: "black",
  fontFamily: "var(--font-montserrat)",
  fontWeight: 800,
  fontSize: "6.250cqw",
  letterSpacing: "0.1875cqw",
  lineHeight: 1.2,
  margin: 0,
} as const;

export default function BrandIdentitySection() {
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
        {/* Marquee ticker band — escapes the 16:9 frame to span the full viewport
         * width so it isn't pillarboxed on aspect ratios wider than 16:9.
         * Vertical position stays tied to the frame so it lines up with section content. */}
        <div
          className="absolute flex items-center overflow-hidden bg-black"
          style={{
            top: "21.389%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "100vw",
            height: "9.259%",
          }}
        >
          <div className="animate-marquee flex shrink-0 whitespace-nowrap">
            {/* Sequence repeated 6× total: 3 unique cycles × 2 halves for seamless -50% loop */}
            {Array.from({ length: 6 }).flatMap((_, copyIdx) =>
              MARQUEE_ITEMS.map((label, itemIdx) => (
                <span
                  key={`${copyIdx}-${itemIdx}`}
                  className="uppercase whitespace-nowrap"
                  style={marqueeItemStyle}
                >
                  {label}
                </span>
              )),
            )}
          </div>
        </div>

        {/* Headline: BRAND ID[face]NTITY (face image substitutes for the "E") */}
        <p
          className="absolute uppercase whitespace-nowrap"
          style={{ ...headlineStyle, left: "16.094%" }}
        >
          Brand
        </p>
        <p
          className="absolute uppercase whitespace-nowrap"
          style={{ ...headlineStyle, left: "43.854%" }}
        >
          ID
        </p>
        <div
          className="absolute overflow-hidden"
          style={{
            top: "41.481%",
            left: "51.875%",
            width: "11.406%",
            height: "10.093%",
          }}
        >
          <img
            src="/images/brand/identity-portrait.png"
            alt=""
            aria-hidden
            className="size-full select-none object-cover object-center"
          />
        </div>
        <p
          className="absolute uppercase whitespace-nowrap"
          style={{ ...headlineStyle, left: "63.802%" }}
        >
          ntity
        </p>

        {/* Korean subtitle (40px Pretendard Bold) */}
        <div
          className="absolute"
          style={{
            top: "54.907%",
            left: "16.719%",
            color: "#242424",
            fontFamily: "'Pretendard', sans-serif",
            fontWeight: 700,
            fontSize: "2.083cqw",
            lineHeight: 1.5,
          }}
        >
          <p className="whitespace-pre" style={{ margin: 0 }}>
            {"우리는 가장 깊은 곳에서 본질을 찾고, "}
          </p>
          <p className="whitespace-pre" style={{ margin: 0 }}>
            {"      가장 높은 곳으로 가치를 확장합니다."}
          </p>
        </div>

        {/* Korean body (20px Pretendard Regular) */}
        <div
          className="absolute"
          style={{
            top: "67.870%",
            left: "16.719%",
            color: "#242424",
            fontFamily: "'Pretendard', sans-serif",
            fontWeight: 400,
            fontSize: "1.042cqw",
            lineHeight: 1.5,
          }}
        >
          <p className="whitespace-pre" style={{ margin: 0 }}>
            머스트 엘더트리엔(Must Eldertrien)은 오랜 시간 흔들림 없이 자리를 지키는 고목(Elder Tree)의 생명력과 지혜에서 영감을 받았습니다.
          </p>
          <p className="whitespace-pre" style={{ margin: 0 }}>
            {"          우리는 비즈니스의 유행을 쫓기보다, 변하지 않는 본질(Root)을 강화하여 지속 가능한 성장(Growth)을 설계합니다."}
          </p>
        </div>

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
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          © 2026 MUST ELDERTREE
        </p>
      </div>
    </section>
  );
}
