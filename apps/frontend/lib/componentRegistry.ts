import type {
  CategoryHeaderProps,
  CategoryNavProps,
  FooterProps,
  HeroProps,
  ItemCardProps,
  SlotName,
} from "@qr-menu/shared-types";
import type { ComponentType } from "react";

type SlotPropsMap = {
  hero: HeroProps;
  categoryNav: CategoryNavProps;
  itemCard: ItemCardProps;
  categoryHeader: CategoryHeaderProps;
  footer: FooterProps;
};

type Registry<T> = Record<string, () => Promise<{ default: ComponentType<T> }>>;

const registry: {
  [K in keyof SlotPropsMap]: Registry<SlotPropsMap[K]>;
} = {
  hero: {
    fullBleed: () => import("@/components/hero/FullBleed"),
    compact: () => import("@/components/hero/Compact"),
    logoOnly: () => import("@/components/hero/LogoOnly"),
  },
  categoryNav: {
    scrollTabs: () => import("@/components/categoryNav/ScrollTabs"),
    sidebarList: () => import("@/components/categoryNav/SidebarList"),
    dropdown: () => import("@/components/categoryNav/Dropdown"),
  },
  itemCard: {
    imageTop: () => import("@/components/itemCard/ImageTop"),
    imageLeft: () => import("@/components/itemCard/ImageLeft"),
    magazine: () => import("@/components/itemCard/Magazine"),
    minimalList: () => import("@/components/itemCard/MinimalList"),
    noImage: () => import("@/components/itemCard/NoImage"),
  },
  categoryHeader: {
    banner: () => import("@/components/categoryHeader/Banner"),
    underline: () => import("@/components/categoryHeader/Underline"),
    minimal: () => import("@/components/categoryHeader/Minimal"),
  },
  footer: {
    full: () => import("@/components/footer/Full"),
    minimal: () => import("@/components/footer/Minimal"),
    hidden: () => import("@/components/footer/Hidden"),
  },
};

export function getSlotVariants(slot: SlotName) {
  return Object.keys(registry[slot]);
}

export async function resolveComponent<TSlot extends keyof SlotPropsMap>(
  slot: TSlot,
  variant: string,
) {
  const slotRegistry = registry[slot];
  const loader =
    slotRegistry[variant] ?? slotRegistry[Object.keys(slotRegistry)[0]];
  const mod = await loader();
  return mod.default as ComponentType<SlotPropsMap[TSlot]>;
}
