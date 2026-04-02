import type { ThemeConfig } from "@qr-menu/shared-types";

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
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
