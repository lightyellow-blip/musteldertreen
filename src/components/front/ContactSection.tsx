type ContactRow = {
  label: string;
  value: string;
  topLabel: string;
  topValue: string;
};

const CONTACT_ROWS: ContactRow[] = [
  {
    label: "Project Contact",
    value: "Limegreen@must.company",
    topLabel: "41.389%", // 447/1080
    topValue: "44.815%", // 484/1080
  },
  {
    label: "Phone Number",
    value: "+82.10.7158.6741",
    topLabel: "53.796%", // 581/1080
    topValue: "57.222%", // 618/1080
  },
  {
    label: "Office Number",
    value: "+82.507.1331.6256",
    topLabel: "66.204%", // 715/1080
    topValue: "69.630%", // 752/1080
  },
];

export default function ContactSection() {
  return (
    <section
      data-section-theme="dark"
      data-header-backdrop="hidden"
      className="relative flex w-full items-center justify-center overflow-hidden bg-black"
      style={{ height: "100svh" }}
    >
      {/* Building photo — escapes the 16:9 frame to fill the entire section/viewport
       * so it doesn't get pillarboxed on aspect ratios wider than 16:9.
       * `object-position: center top` keeps the upper portion (sky+roofline)
       * visible like the Figma composition. */}
      <div className="absolute inset-0">
        <picture>
          <source srcSet="/images/contact/building.avif" type="image/avif" />
          <img
            src="/images/contact/building.webp"
            alt=""
            aria-hidden
            className="pointer-events-none size-full select-none object-cover"
            style={{ transform: "scaleX(-1)", objectPosition: "center top" }}
          />
        </picture>
      </div>

      <div
        className="relative mx-auto"
        style={{
          width: "min(100vw, calc(100svh * 1920 / 1080))",
          height: "min(100svh, calc(100vw * 1080 / 1920))",
          containerType: "size",
        }}
      >
        {/* "Hey There!" oversized watermark (white 20% opacity, overflows left edge) */}
        <p
          className="absolute whitespace-nowrap"
          style={{
            top: "32.407%",
            left: "-1.667%",
            color: "rgba(255,255,255,0.2)",
            fontFamily: "var(--font-montserrat)",
            fontWeight: 700,
            fontSize: "20.833cqw",
            lineHeight: "normal",
            margin: 0,
          }}
        >
          Hey There!
        </p>

        {/* "Find us here!" small label */}
        <p
          className="absolute whitespace-nowrap"
          style={{
            top: "20.370%",
            left: "8.333%",
            color: "white",
            fontFamily: "var(--font-montserrat)",
            fontWeight: 700,
            fontSize: "0.938cqw",
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Find us here!{" "}
        </p>

        {/* Address (2 lines, whitespace-pre to keep the leading-space indent on line 2) */}
        <div
          className="absolute"
          style={{
            top: "24.352%",
            left: "8.333%",
            color: "white",
            fontFamily: "var(--font-montserrat)",
            fontWeight: 800,
            fontSize: "1.250cqw",
            letterSpacing: "0.0375cqw",
            lineHeight: 1.5,
          }}
        >
          <p className="whitespace-pre" style={{ margin: 0 }}>
            {"4F, 48 Nonhyeon-ro 135-gil, "}
          </p>
          <p className="whitespace-pre" style={{ margin: 0 }}>
            {"    Gangnam-gu, Seoul"}
          </p>
        </div>

        {/* Contact card overlay */}
        <div
          className="absolute"
          style={{
            top: "35.833%",
            left: "49.063%",
            width: "42.604%",
            height: "45.000%",
            background: "rgba(0,0,0,0.9)",
          }}
        />

        {/* Contact rows (label + big value) */}
        {CONTACT_ROWS.map((row) => (
          <div key={row.label}>
            <p
              className="absolute whitespace-nowrap"
              style={{
                top: row.topLabel,
                left: "51.667%",
                color: "white",
                fontFamily: "var(--font-montserrat)",
                fontWeight: 500,
                fontSize: "0.938cqw",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {row.label}
            </p>
            <p
              className="absolute whitespace-nowrap"
              style={{
                top: row.topValue,
                left: "52.708%",
                color: "white",
                fontFamily: "var(--font-montserrat)",
                fontWeight: 800,
                fontSize: "1.823cqw",
                letterSpacing: "0.0547cqw",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              {row.value}
            </p>
          </div>
        ))}

        {/* Copyright (white on this section, not the gray used elsewhere) */}
        <p
          className="absolute whitespace-nowrap"
          style={{
            top: "94.074%",
            left: "89.167%",
            color: "white",
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
