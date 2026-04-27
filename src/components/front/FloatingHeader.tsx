export default function FloatingHeader() {
  return (
    <div className="main-enter pointer-events-none fixed inset-0 z-40 flex items-start justify-center">
      <div
        className="relative"
        style={{
          width: "min(100vw, calc(100svh * 1920 / 1080))",
          height: "min(100svh, calc(100vw * 1080 / 1920))",
          containerType: "size",
        }}
      >
        {/* Header backdrop — keeps logos/nav legible over scrolling content.
         * Height stops at 12% so it never overlaps section content
         * ("Our Approach:" at 20.370%, BrandIdentity marquee at 21.389%). */}
        <div
          className="absolute bg-white"
          style={{ top: 0, left: 0, width: "100%", height: "12%" }}
        />

        <img
          src="/images/approach/logo-must.svg"
          alt="MUST"
          className="absolute"
          style={{ top: "5.556%", left: "3.125%", width: "3.002cqw", height: "0.744cqw" }}
        />
        <img
          src="/images/approach/logo-eldertree.svg"
          alt="ELEDRTREE"
          className="absolute"
          style={{ top: "7.536%", left: "3.125%", width: "6.250cqw", height: "0.715cqw" }}
        />

        <nav
          className="pointer-events-auto absolute flex items-center"
          style={{
            top: "6.481%",
            right: "3.125%",
            gap: "3.125cqw",
            color: "#242424",
            fontSize: "0.833cqw",
            fontFamily: "var(--font-montserrat)",
            fontWeight: 700,
            lineHeight: 1.2,
          }}
        >
          <a href="#" className="whitespace-nowrap">Work</a>
          <a href="#" className="whitespace-nowrap">Service</a>
          <a href="#" className="whitespace-nowrap">Contact</a>
        </nav>
      </div>
    </div>
  );
}
