"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

export default function FloatingHeader() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const update = () => {
      // Probe at the y-coordinate where the header logos sit (~5.5% of viewport)
      // so the theme flips right when a new section reaches the header line.
      const probeY = window.innerHeight * 0.055;
      const sections = document.querySelectorAll<HTMLElement>("[data-section-theme]");

      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) {
          const t = section.dataset.sectionTheme;
          if (t === "dark" || t === "light") setTheme(t);
          return;
        }
      }
    };

    let raf = 0;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        update();
      });
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const isDark = theme === "dark";

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
         * Escapes the 16:9 frame to span the full viewport width so it isn't
         * pillarboxed on aspect ratios wider than 16:9. Height stays tied to
         * the frame so it never overlaps section content
         * ("Our Approach:" at 20.370%, BrandIdentity marquee at 21.389%). */}
        <div
          className="absolute transition-colors duration-300"
          style={{
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "100vw",
            height: "12%",
            background: isDark ? "black" : "white",
          }}
        />

        <img
          src="/images/approach/logo-must.svg"
          alt="MUST"
          className="absolute transition-[filter] duration-300"
          style={{
            top: "5.556%",
            left: "3.125%",
            width: "3.002cqw",
            height: "0.744cqw",
            filter: `invert(${isDark ? 1 : 0})`,
          }}
        />
        <img
          src="/images/approach/logo-eldertree.svg"
          alt="ELEDRTREE"
          className="absolute transition-[filter] duration-300"
          style={{
            top: "7.536%",
            left: "3.125%",
            width: "6.250cqw",
            height: "0.715cqw",
            filter: `invert(${isDark ? 1 : 0})`,
          }}
        />

        <nav
          className="pointer-events-auto absolute flex items-center transition-colors duration-300"
          style={{
            top: "6.481%",
            right: "3.125%",
            gap: "3.125cqw",
            color: isDark ? "white" : "#242424",
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
