import type { SlotName, ThemeConfig } from "@qr-menu/shared-types";

export const FONT_OPTIONS = [
  "Syne",
  "Playfair Display",
  "Lora",
  "DM Serif Display",
  "Space Grotesk",
  "Manrope",
] as const;

export const DEFAULT_THEME: ThemeConfig = {
  colors: {
    primary: "#c06b3e",
    bg: "#fffaf2",
    text: "#1d140f",
    accent: "#9ac7b8",
  },
  font: "Syne",
  borderRadius: "lg",
  darkMode: false,
  showImages: true,
  heroImage: "",
  components: {
    hero: "fullBleed",
    categoryNav: "scrollTabs",
    itemCard: "imageTop",
    categoryHeader: "underline",
    footer: "minimal",
  },
};

export const SLOT_LABELS: Record<SlotName, string> = {
  hero: "Hero",
  categoryNav: "Category Nav",
  itemCard: "Item Card",
  categoryHeader: "Category Header",
  footer: "Footer",
};

export function resolveRadiusValue(radius: ThemeConfig["borderRadius"]) {
  switch (radius) {
    case "none":
      return "0px";
    case "sm":
      return "0.5rem";
    case "md":
      return "0.9rem";
    case "lg":
      return "1.25rem";
    case "full":
      return "9999px";
    default:
      return "1rem";
  }
}
