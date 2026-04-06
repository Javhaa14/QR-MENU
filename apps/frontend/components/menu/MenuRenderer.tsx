"use client";

import { useEffect, useMemo, useState, type ComponentType } from "react";

import type {
  CategoryHeaderProps,
  CategoryNavProps,
  FooterProps,
  HeroProps,
  ItemCardProps,
  Menu,
  Restaurant,
} from "@qr-menu/shared-types";

import Banner from "@/components/categoryHeader/Banner";
import ScrollTabs from "@/components/categoryNav/ScrollTabs";
import MinimalFooter from "@/components/footer/Minimal";
import FullBleedHero from "@/components/hero/FullBleed";
import ImageTop from "@/components/itemCard/ImageTop";
import { resolveComponent } from "@/lib/componentRegistry";
import { ThemeProvider } from "@/providers/ThemeProvider";

import { FloatingCartBar } from "./FloatingCartBar";
import { MenuTopBar } from "./MenuTopBar";

interface MenuRendererProps {
  restaurant: Restaurant;
  menu: Menu;
  onAdd?: ItemCardProps["onAdd"];
  slug?: string;
  showCartBar?: boolean;
  showAddButton?: boolean;
}

interface ResolvedSlots {
  Hero: ComponentType<HeroProps>;
  CategoryNav: ComponentType<CategoryNavProps>;
  ItemCard: ComponentType<ItemCardProps>;
  CategoryHeader: ComponentType<CategoryHeaderProps>;
  Footer: ComponentType<FooterProps>;
}

const defaultSlots: ResolvedSlots = {
  Hero: FullBleedHero,
  CategoryNav: ScrollTabs,
  ItemCard: ImageTop,
  CategoryHeader: Banner,
  Footer: MinimalFooter,
};

export function MenuRenderer({
  restaurant,
  menu,
  onAdd,
  slug,
  showCartBar = false,
  showAddButton = true,
}: MenuRendererProps) {
  const [slots, setSlots] = useState<ResolvedSlots>(defaultSlots);
  const [activeCategoryId, setActiveCategoryId] = useState(menu.categories[0]?._id);
  const featuredItem = useMemo(
    () =>
      menu.categories
        .flatMap((category) => category.items)
        .filter((item) => item.isAvailable)
        .find((item) => item.image) ??
      menu.categories
        .flatMap((category) => category.items)
        .find((item) => item.isAvailable),
    [menu.categories],
  );

  useEffect(() => {
    setActiveCategoryId(menu.categories[0]?._id);
  }, [menu.categories]);

  useEffect(() => {
    let cancelled = false;

    async function loadSlots() {
      const [Hero, CategoryNav, ItemCard, CategoryHeader, Footer] =
        await Promise.all([
          resolveComponent("hero", restaurant.themeConfig.components.hero),
          resolveComponent(
            "categoryNav",
            restaurant.themeConfig.components.categoryNav,
          ),
          resolveComponent("itemCard", restaurant.themeConfig.components.itemCard),
          resolveComponent(
            "categoryHeader",
            restaurant.themeConfig.components.categoryHeader,
          ),
          resolveComponent("footer", restaurant.themeConfig.components.footer),
        ]);

      if (!cancelled) {
        setSlots({
          Hero,
          CategoryNav,
          ItemCard,
          CategoryHeader,
          Footer,
        });
      }
    }

    void loadSlots();

    return () => {
      cancelled = true;
    };
  }, [restaurant.themeConfig.components]);

  const gridClassName = useMemo(() => {
    if (restaurant.themeConfig.components.itemCard === "imageTop") {
      return "grid gap-8 md:grid-cols-2";
    }

    return restaurant.themeConfig.components.itemCard === "minimalList"
      ? "grid gap-3"
      : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";
  }, [restaurant.themeConfig.components.itemCard]);

  const handleCategorySelect = (categoryId: string) => {
    setActiveCategoryId(categoryId);
    document
      .getElementById(`category-${categoryId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const jumpToElement = (id?: string) => {
    if (!id) {
      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <ThemeProvider config={restaurant.themeConfig}>
      <main className="min-h-screen pb-24">
        <div className="mx-auto flex max-w-[1080px] flex-col px-4 md:px-6">
          <MenuTopBar
            restaurant={restaurant}
            onMenuClick={() => jumpToElement("menu-category-nav")}
            onSearchClick={() =>
              jumpToElement(featuredItem ? "menu-featured" : activeCategoryId ? `category-${activeCategoryId}` : undefined)
            }
          />

          <div className="flex flex-col gap-10 pb-10 pt-5 md:pt-6">
            <div id="menu-featured">
              <slots.Hero
                restaurant={restaurant}
                featuredItem={featuredItem}
              />
            </div>

            <div id="menu-category-nav">
              <slots.CategoryNav
                categories={menu.categories}
                activeCategoryId={activeCategoryId}
                onSelect={handleCategorySelect}
              />
            </div>

            <div className="grid gap-12">
            {menu.categories.map((category) => (
              <section
                key={category._id}
                id={`category-${category._id}`}
                className="scroll-mt-36 space-y-6"
              >
                <slots.CategoryHeader category={category} />
                <div className={gridClassName}>
                  {category.items
                    .filter((item) => item.isAvailable)
                    .map((item) =>
                      showAddButton && onAdd ? (
                        <slots.ItemCard
                          key={item._id}
                          item={item}
                          onAdd={onAdd}
                        />
                      ) : (
                        <slots.ItemCard
                          key={item._id}
                          item={item}
                          showAddButton={false}
                        />
                      ),
                    )}
                </div>
              </section>
            ))}
            </div>

            <slots.Footer restaurant={restaurant} />
          </div>
        </div>
        {showCartBar && slug ? <FloatingCartBar slug={slug} /> : null}
      </main>
    </ThemeProvider>
  );
}
