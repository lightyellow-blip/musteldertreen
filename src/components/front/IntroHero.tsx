export default function IntroHero() {
  return (
    <div className="intro-exit fixed inset-0 z-30 w-full overflow-hidden bg-black">
      <div
        className="absolute top-1/2 -translate-y-1/2"
        style={{
          left: "13.802%",
          width: "41.096%",
          aspectRatio: "789.052 / 221",
        }}
      >
        <div
          className="relative h-full w-full animate-fade-in-up"
          style={{
            WebkitMaskImage: "url(/images/main/text-mask.svg)",
            maskImage: "url(/images/main/text-mask.svg)",
            WebkitMaskSize: "100% 100%",
            maskSize: "100% 100%",
            WebkitMaskRepeat: "no-repeat",
            maskRepeat: "no-repeat",
            WebkitMaskPosition: "center",
            maskPosition: "center",
          }}
        >
          <picture>
            <source srcSet="/images/main/bg1.avif" type="image/avif" />
            <img
              src="/images/main/bg1.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute max-w-none select-none"
              style={{
                width: "491.9%",
                height: "1134.4%",
                left: "-121.9%",
                top: "-473.1%",
              }}
            />
          </picture>
          <picture>
            <source srcSet="/images/main/bg2.avif" type="image/avif" />
            <img
              src="/images/main/bg2.webp"
              alt=""
              aria-hidden
              className="pointer-events-none absolute max-w-none select-none"
              style={{
                width: "387.5%",
                height: "993.2%",
                left: "-62.1%",
                top: "-350.4%",
              }}
            />
          </picture>
        </div>
      </div>
    </div>
  );
}
