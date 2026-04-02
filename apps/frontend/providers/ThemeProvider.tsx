"use client";

import { useEffect, type CSSProperties, type ReactNode } from "react";

import type { ThemeConfig } from "@qr-menu/shared-types";

import { resolveRadiusValue } from "@/lib/theme";

const DISPLAY_FONT_HREFS: Record<string, string> = {
  Syne:
    "https://fonts.googleapis.com/css2?family=Syne:wght@500;600;700&display=swap",
  "Playfair Display":
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap",
  Lora:
    "https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&display=swap",
  "DM Serif Display":
    "https://fonts.googleapis.com/css2?family=DM+Serif+Display&display=swap",
  "Space Grotesk":
    "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;700&display=swap",
  Manrope:
    "https://fonts.googleapis.com/css2?family=Manrope:wght@500;700&display=swap",
};

const DISPLAY_FONT_FAMILIES: Record<string, string> = {
  Syne: "'Syne', system-ui, sans-serif",
  "Playfair Display": "'Playfair Display', Georgia, serif",
  Lora: "'Lora', Georgia, serif",
  "DM Serif Display": "'DM Serif Display', Georgia, serif",
  "Space Grotesk": "'Space Grotesk', system-ui, sans-serif",
  Manrope: "'Manrope', system-ui, sans-serif",
};

export function ThemeProvider({
  config,
  children,
}: {
  config: ThemeConfig;
  children: ReactNode;
}) {
  useEffect(() => {
    const href = DISPLAY_FONT_HREFS[config.font];

    if (!href) {
      return;
    }

    const id = "qr-menu-display-font";
    let link = document.getElementById(id) as HTMLLinkElement | null;

    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    if (link.href !== href) {
      link.href = href;
    }
  }, [config.font]);

  return (
    <div
      style={
        {
          "--color-primary": config.colors.primary,
          "--color-bg": config.colors.bg,
          "--color-text": config.colors.text,
          "--color-accent": config.colors.accent,
          "--radius": resolveRadiusValue(config.borderRadius),
          "--font-body": "'Inter', system-ui, sans-serif",
          "--font-display":
            DISPLAY_FONT_FAMILIES[config.font] ?? DISPLAY_FONT_FAMILIES.Syne,
        } as CSSProperties
      }
    >
      {children}
    </div>
  );
}
