export default function ApproachSection() {
  return (
    <section
      data-section-theme="light"
      className="main-enter relative flex w-full items-center justify-center overflow-hidden bg-white"
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
        {/* Image Card 1: IM Bank */}
        <div
          className="absolute overflow-hidden"
          style={{ top: "22.870%", left: "46.458%", width: "53.542%", height: "16.019%" }}
        >
          <picture>
            <source srcSet="/images/approach/im-photo1.avif" type="image/avif" />
            <img
              src="/images/approach/im-photo1.webp"
              alt=""
              aria-hidden
              className="pointer-events-none size-full select-none object-cover"
            />
          </picture>
          <p
            className="absolute whitespace-nowrap text-right"
            style={{
              right: "5.837%",
              bottom: "28.902%",
              color: "white",
              fontFamily: "var(--font-montserrat)",
              fontWeight: 700,
              fontSize: "1.042cqw",
              lineHeight: 1.5,
            }}
          >
            IM Bank
          </p>
        </div>

        {/* Progress bar (track + red fill) */}
        <div
          className="absolute bg-white"
          style={{ top: "38.519%", left: "46.458%", width: "53.542%", height: "0.370%" }}
        />
        <div
          className="absolute"
          style={{ top: "38.519%", left: "46.458%", width: "10.990%", height: "0.370%", background: "red" }}
        />

        {/* Image Card 2: Guidi (two overlapping copies) */}
        <div
          className="absolute overflow-hidden"
          style={{ top: "38.889%", left: "77.292%", width: "22.708%", height: "16.019%" }}
        >
          <div
            className="absolute"
            style={{ left: "-30.505%", top: "-126.012%", width: "160.554%", height: "312.055%" }}
          >
            <picture>
              <source srcSet="/images/approach/guidi-photo.avif" type="image/avif" />
              <img
                src="/images/approach/guidi-photo.webp"
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full object-cover select-none"
              />
            </picture>
          </div>
          <div
            className="absolute"
            style={{ left: "-21.560%", top: "-69.364%", width: "142.964%", height: "277.867%" }}
          >
            <picture>
              <source srcSet="/images/approach/guidi-photo.avif" type="image/avif" />
              <img
                src="/images/approach/guidi-photo.webp"
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full object-cover select-none"
              />
            </picture>
          </div>
        </div>

        {/* Image Card 3: visual-pc (grayscale) */}
        <div
          className="absolute overflow-hidden"
          style={{ top: "54.907%", left: "77.292%", width: "22.708%", height: "16.019%" }}
        >
          <div
            className="absolute"
            style={{
              left: "-166.284%",
              top: "-319.075%",
              width: "338.832%",
              height: "435.862%",
              filter: "grayscale(1)",
            }}
          >
            <picture>
              <source srcSet="/images/approach/visual-pc.avif" type="image/avif" />
              <img
                src="/images/approach/visual-pc.webp"
                alt=""
                aria-hidden
                className="pointer-events-none absolute inset-0 size-full object-cover select-none"
              />
            </picture>
          </div>
        </div>

        {/* Our Approach label */}
        <p
          className="absolute whitespace-nowrap"
          style={{
            top: "20.370%",
            left: "8.333%",
            color: "#242424",
            fontFamily: "var(--font-montserrat)",
            fontWeight: 700,
            fontSize: "0.938cqw",
            lineHeight: 1.5,
          }}
        >
          Our Approach:
        </p>

        {/* Headline: Crafting identity& */}
        <div
          className="absolute uppercase"
          style={{
            top: "30.278%",
            left: "13.802%",
            color: "black",
            fontFamily: "var(--font-montserrat)",
            fontWeight: 800,
            fontSize: "6.250cqw",
            letterSpacing: "0.1875cqw",
            lineHeight: "6.250cqw",
          }}
        >
          <p style={{ margin: 0 }}>Crafting</p>
          <p style={{ margin: 0 }}>identity&amp;</p>
        </div>

        {/* Headline: experience — rolling banner (3 frames + duplicate for seamless loop) */}
        <div
          className="absolute overflow-hidden"
          style={{
            top: "53.426%",
            left: "13.802%",
            height: "6.250cqw",
          }}
        >
          <div className="experience-roll">
            {/* Frame 1: original script text */}
            <p
              className="uppercase whitespace-nowrap"
              style={{
                color: "red",
                fontFamily: "var(--font-mrs-sheppards)",
                fontSize: "5.729cqw",
                letterSpacing: "0.172cqw",
                lineHeight: "6.250cqw",
                height: "6.250cqw",
                margin: 0,
              }}
            >
              experience
            </p>
            {/* Frame 2: bold red EXPERIENCE */}
            <div style={{ height: "6.250cqw", display: "flex", alignItems: "center" }}>
              <img
                src="/images/main/experience_02.png"
                alt=""
                aria-hidden
                className="pointer-events-none select-none"
                style={{ display: "block", height: "3.125cqw", width: "auto", maxWidth: "none" }}
              />
            </div>
            {/* Frame 3: serif EXPERIENCE */}
            <div style={{ height: "6.250cqw", display: "flex", alignItems: "center" }}>
              <img
                src="/images/main/experience_03.png"
                alt=""
                aria-hidden
                className="pointer-events-none select-none"
                style={{ display: "block", height: "3.125cqw", width: "auto", maxWidth: "none" }}
              />
            </div>
            {/* Frame 4: duplicate of Frame 1 for seamless loop */}
            <p
              className="uppercase whitespace-nowrap"
              style={{
                color: "red",
                fontFamily: "var(--font-mrs-sheppards)",
                fontSize: "5.729cqw",
                letterSpacing: "0.172cqw",
                lineHeight: "6.250cqw",
                height: "6.250cqw",
                margin: 0,
              }}
            >
              experience
            </p>
          </div>
        </div>

        {/* Korean subtitle */}
        <p
          className="absolute whitespace-pre"
          style={{
            top: "67.315%",
            left: "14.479%",
            color: "black",
            fontFamily: "'Pretendard', sans-serif",
            fontWeight: 500,
            fontSize: "1.563cqw",
            lineHeight: 1.2,
            margin: 0,
          }}
        >
          {"          우리는 정체성과 경험을 빚어냅니다."}
        </p>

        {/* SCROLL label + arrow */}
        <div
          className="absolute flex items-center"
          style={{ top: "84.815%", left: "13.802%", gap: "1.563cqw" }}
        >
          <p
            style={{
              color: "#242424",
              fontFamily: "var(--font-montserrat)",
              fontWeight: 700,
              fontSize: "0.938cqw",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            SCROLL
          </p>
          <img
            src="/images/approach/arrow-right.svg"
            alt=""
            aria-hidden
            style={{ width: "1.250cqw", height: "1.250cqw", transform: "rotate(90deg)" }}
          />
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
