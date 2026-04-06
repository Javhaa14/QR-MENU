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
  hero: "Толгой хэсэг",
  categoryNav: "Ангиллын навигаци",
  itemCard: "Хоолны карт",
  categoryHeader: "Ангиллын гарчиг",
  footer: "Хөл хэсэг",
};

const SLOT_VARIANT_LABELS: Record<SlotName, Record<string, string>> = {
  hero: {
    fullBleed: "Дэлгэц дүүрэн",
    compact: "Компакт",
    logoOnly: "Лого төвтэй",
  },
  categoryNav: {
    scrollTabs: "Гүйлгэдэг товч",
    dropdown: "Сонголтын жагсаалт",
    sidebarList: "Хажуу жагсаалт",
  },
  itemCard: {
    imageTop: "Дээрээ зурагтай",
    imageLeft: "Зүүн зурагтай",
    minimalList: "Энгийн жагсаалт",
    magazine: "Онцлох постер",
    noImage: "Зураггүй",
  },
  categoryHeader: {
    banner: "Баннер",
    underline: "Доогуур зураастай",
    minimal: "Энгийн",
  },
  footer: {
    minimal: "Энгийн",
    full: "Дэлгэрэнгүй",
    hidden: "Нуух",
  },
};

export function getSlotVariantLabel(slot: SlotName, variant: string) {
  return SLOT_VARIANT_LABELS[slot]?.[variant] ?? variant;
}

export function sanitizeThemeConfig(value: unknown): ThemeConfig {
  const input = (value ?? {}) as Partial<ThemeConfig> & {
    colors?: Partial<ThemeConfig["colors"]> & { _id?: unknown };
    components?: Partial<ThemeConfig["components"]> & { _id?: unknown };
    _id?: unknown;
  };

  return {
    colors: {
      primary: input.colors?.primary ?? DEFAULT_THEME.colors.primary,
      bg: input.colors?.bg ?? DEFAULT_THEME.colors.bg,
      text: input.colors?.text ?? DEFAULT_THEME.colors.text,
      accent: input.colors?.accent ?? DEFAULT_THEME.colors.accent,
    },
    font: input.font ?? DEFAULT_THEME.font,
    borderRadius: input.borderRadius ?? DEFAULT_THEME.borderRadius,
    darkMode: input.darkMode ?? DEFAULT_THEME.darkMode,
    showImages: input.showImages ?? DEFAULT_THEME.showImages,
    heroImage: input.heroImage ?? DEFAULT_THEME.heroImage,
    components: {
      hero: input.components?.hero ?? DEFAULT_THEME.components.hero,
      categoryNav:
        input.components?.categoryNav ?? DEFAULT_THEME.components.categoryNav,
      itemCard: input.components?.itemCard ?? DEFAULT_THEME.components.itemCard,
      categoryHeader:
        input.components?.categoryHeader ??
        DEFAULT_THEME.components.categoryHeader,
      footer: input.components?.footer ?? DEFAULT_THEME.components.footer,
    },
  };
}

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
