export default function ValuePropositionSection() {
  return (
    <section
      data-section-theme="dark"
      className="relative flex w-full items-center justify-center overflow-hidden bg-black"
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
        {/* "Value Proposition :" small label */}
        <p
          className="absolute whitespace-nowrap"
          style={{
            top: "23.056%",
            left: "8.333%",
            color: "white",
            fontFamily: "var(--font-montserrat)",
            fontWeight: 700,
            fontSize: "0.938cqw",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Value Proposition :
        </p>

        {/* Massive watermark "Value Proposition" — overflows past the right edge,
         * clipped by the section's overflow-hidden to mimic the Figma composition. */}
        <p
          className="absolute whitespace-nowrap uppercase"
          style={{
            top: "32.870%",
            left: "0.313%",
            color: "rgba(255,255,255,0.1)",
            fontFamily: "var(--font-montserrat)",
            fontWeight: 700,
            fontSize: "20.833cqw",
            lineHeight: "normal",
            letterSpacing: "0",
            margin: 0,
          }}
        >
          Value Proposition
        </p>

        {/* Image card — opacity 0.6 so the white headline stays readable on top.
         * Inner image is upscaled and offset to mimic the Figma mask crop. */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: "30.926%",
            left: "16.094%",
            width: "68.281%",
            height: "49.074%",
            opacity: 0.6,
          }}
        >
          <picture>
            <source srcSet="/images/value-prop/integrity-meeting.avif" type="image/avif" />
            <img
              src="/images/value-prop/integrity-meeting.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute select-none"
              style={{
                left: "-16.018%",
                top: "-31.321%",
                width: "125.858%",
                height: "198.302%",
                maxWidth: "none",
                objectFit: "fill",
              }}
            />
          </picture>
        </div>

        {/* Headline: INTEGRITY */}
        <p
          className="absolute uppercase whitespace-nowrap"
          style={{
            top: "40.278%",
            left: "calc(50% + 6.146cqw)",
            color: "white",
            fontFamily: "var(--font-montserrat)",
            fontWeight: 800,
            fontSize: "6.250cqw",
            lineHeight: "normal",
            margin: 0,
          }}
        >
          Integrity
        </p>

        {/* Korean subtitle */}
        <div
          className="absolute"
          style={{
            top: "55.463%",
            left: "calc(50% + 8.281cqw)",
            color: "white",
            fontFamily: "'Pretendard', sans-serif",
            fontWeight: 400,
            fontSize: "2.083cqw",
            lineHeight: 1.5,
          }}
        >
          <p style={{ margin: 0 }}>진정성 있는 접근으로 브랜드의 진정한</p>
          <p style={{ margin: 0 }}>매력을 발굴합니다.</p>
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
