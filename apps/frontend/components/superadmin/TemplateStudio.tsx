"use client";

import { useEffect, useState } from "react";
import { 
  ArrowLeftOutlined, 
  SaveOutlined, 
  SkinOutlined, 
  LayoutOutlined,
  InfoCircleOutlined
} from "@ant-design/icons";
import Link from "next/link";

import type { BrandConfig, Menu, Restaurant, SlotName, Template, ThemeConfig } from "@qr-menu/shared-types";
import { FONT_OPTIONS, SLOT_LABELS, getSlotVariantLabel } from "@/lib/theme";
import { getSlotVariants } from "@/lib/componentRegistry";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { MenuRenderer } from "@/components/menu/MenuRenderer";

const MOCK_MENU: Menu = {
  _id: "mock-menu",
  restaurantId: "mock-res",
  isActive: true,
  categories: [
    {
      _id: "cat-1",
      name: "Specialty Pizzas",
      items: [
        {
          _id: "item-1",
          name: "Truffle Mushroom",
          description: "Wild mushrooms, truffle oil, mozzarella, and fresh thyme.",
          price: 24,
          currency: "MNT",
          image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=60",
          tags: ["Vegetarian", "Best Seller"],
          allergens: ["Gluten", "Dairy"],
          isAvailable: true,
        },
        {
          _id: "item-2",
          name: "Spicy Salami",
          description: "Italian salami, chili flakes, honey drizzle, and basil.",
          price: 22,
          currency: "MNT",
          image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&auto=format&fit=crop&q=60",
          tags: ["Spicy"],
          allergens: ["Gluten", "Dairy"],
          isAvailable: true,
        },
      ],
    },
    {
      _id: "cat-2",
      name: "Handcrafted Cocktails",
      items: [
        {
          _id: "item-3",
          name: "Smoked Old Fashioned",
          description: "Bourbon, maple syrup, bitters, and orange peel.",
          price: 16,
          currency: "MNT",
          image: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=60",
          tags: ["House Special"],
          allergens: [],
          isAvailable: true,
        },
      ],
    },
  ],
};

const MOCK_RESTAURANT: Restaurant = {
  _id: "mock-res",
  name: "Bistro Moderne",
  slug: "bistro-moderne",
  isActive: true,
  restaurantType: "menu_only",
  themeConfig: {} as any, // Will be overridden
};

interface TemplateStudioProps {
  initialTemplate?: Partial<Template>;
  onSave: (template: Partial<Template>) => Promise<void>;
  title: string;
}

export function TemplateStudio({ initialTemplate, onSave, title }: TemplateStudioProps) {
  const [template, setTemplate] = useState<Partial<Template>>({
    name: "",
    thumbnail: "",
    description: "",
    active: true,
    slotConfig: {
      hero: "fullBleed",
      categoryNav: "scrollTabs",
      itemCard: "imageTop",
      categoryHeader: "underline",
      footer: "minimal",
    },
    defaultBrand: {
      primary: "#c06b3e",
      bg: "#fffaf2",
      text: "#1d140f",
      accent: "#9ac7b8",
      font: "Syne",
      borderRadius: "lg",
      darkMode: false,
      showImages: true,
      heroImage: "",
    },
    ...initialTemplate,
  });

  const [activeTab, setActiveTab] = useState<"metadata" | "slots" | "brand">("metadata");
  const [saving, setSaving] = useState(false);

  const updateMetadata = (field: keyof Template, value: any) => {
    setTemplate((prev) => ({ ...prev, [field]: value }));
  };

  const updateSlot = (slot: SlotName, variant: string) => {
    setTemplate((prev) => ({
      ...prev,
      slotConfig: { 
        ...prev.slotConfig!, 
        [slot]: variant 
      },
    }));
  };

  const updateBrand = (field: keyof BrandConfig, value: any) => {
    setTemplate((prev) => ({
      ...prev,
      defaultBrand: { ...prev.defaultBrand!, [field]: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(template);
    } finally {
      setSaving(false);
    }
  };

  const currentThemeConfig: ThemeConfig = {
    ...template.defaultBrand!,
    components: template.slotConfig! as Record<SlotName, string>,
  };

  const previewRestaurant: Restaurant = {
    ...MOCK_RESTAURANT,
    name: template.name || MOCK_RESTAURANT.name,
    themeConfig: currentThemeConfig,
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row h-[calc(100vh-140px)]">
      {/* Sidebar Controls */}
      <div className="w-full lg:w-96 flex flex-col gap-4 overflow-y-auto pr-2">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/superadmin/templates" className="grid h-10 w-10 place-items-center rounded-full bg-black/5 hover:bg-black/10 transition">
            <ArrowLeftOutlined />
          </Link>
          <h1 className="font-display text-2xl font-bold text-[#231810]">{title}</h1>
        </div>

        <nav className="flex gap-2 rounded-2xl bg-black/5 p-1 text-sm font-semibold">
          <button
            onClick={() => setActiveTab("metadata")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 transition ${
              activeTab === "metadata" ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black/70"
            }`}
          >
            <InfoCircleOutlined />
            Ерөнхий
          </button>
          <button
            onClick={() => setActiveTab("slots")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 transition ${
              activeTab === "slots" ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black/70"
            }`}
          >
            <LayoutOutlined />
            Бүтэц
          </button>
          <button
            onClick={() => setActiveTab("brand")}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 transition ${
              activeTab === "brand" ? "bg-white text-black shadow-sm" : "text-black/45 hover:text-black/70"
            }`}
          >
            <SkinOutlined />
            Өнгө
          </button>
        </nav>

        <div className="flex-1 space-y-6 rounded-[2rem] border border-black/10 bg-white p-6 shadow-[0_12px_30px_rgba(0,0,0,0.04)]">
          {activeTab === "metadata" && (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-black/45">Загварын нэр</label>
                <input
                  type="text"
                  value={template.name}
                  onChange={(e) => updateMetadata("name", e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-[#fafafa] px-5 py-4 text-sm outline-none focus:border-black/20"
                  placeholder="Бордо бистро"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-black/45">Thumbnail URL</label>
                <input
                  type="text"
                  value={template.thumbnail}
                  onChange={(e) => updateMetadata("thumbnail", e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-[#fafafa] px-5 py-4 text-sm outline-none focus:border-black/20"
                  placeholder="https://example.com/thumb.jpg"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-black/45">Тайлбар</label>
                <textarea
                  rows={4}
                  value={template.description}
                  onChange={(e) => updateMetadata("description", e.target.value)}
                  className="w-full rounded-2xl border border-black/10 bg-[#fafafa] px-5 py-4 text-sm outline-none focus:border-black/20"
                  placeholder="Орчин үеийн цэвэрхэн загвар..."
                />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={template.active}
                  onChange={(e) => updateMetadata("active", e.target.checked)}
                  className="h-5 w-5 rounded-md border-black/10"
                />
                <span className="text-sm font-medium">Идэвхтэй</span>
              </label>
            </div>
          )}

          {activeTab === "slots" && (
            <div className="space-y-6">
              {(Object.keys(SLOT_LABELS) as SlotName[]).map((slot) => (
                <div key={slot} className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-widest text-black/45">
                    {SLOT_LABELS[slot]}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {getSlotVariants(slot).map((variant) => (
                      <button
                        key={variant}
                        onClick={() => updateSlot(slot, variant)}
                        className={`rounded-xl border border-black/8 px-4 py-3 text-xs font-medium transition ${
                          template.slotConfig?.[slot] === variant
                            ? "bg-black text-white"
                            : "bg-[#fafafa] text-black/60 hover:bg-black/5"
                        }`}
                      >
                        {getSlotVariantLabel(slot, variant)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "brand" && (
            <div className="space-y-5">
              {[
                { label: "Үндсэн өнгө", field: "primary" },
                { label: "Дэвсгэр өнгө", field: "bg" },
                { label: "Бичвэр өнгө", field: "text" },
                { label: "Акцент өнгө", field: "accent" },
              ].map((item) => (
                <div key={item.field} className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-widest text-black/45">{item.label}</label>
                  <input
                    type="color"
                    value={(template.defaultBrand as any)[item.field]}
                    onChange={(e) => updateBrand(item.field as any, e.target.value)}
                    className="h-10 w-10 cursor-pointer overflow-hidden rounded-full border-none p-0"
                  />
                </div>
              ))}
              
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-widest text-black/45">Фонт</label>
                <div className="grid grid-cols-2 gap-2">
                  {FONT_OPTIONS.map((f) => (
                    <button
                      key={f}
                      onClick={() => updateBrand("font", f)}
                      className={`rounded-xl border border-black/8 px-3 py-2 text-xs font-medium transition ${
                        template.defaultBrand?.font === f
                          ? "bg-black text-white"
                          : "bg-[#fafafa] text-black/60 hover:bg-black/5"
                      }`}
                      style={{ fontFamily: f === "Syne" ? "Syne, sans-serif" : "Inter, sans-serif" }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold uppercase tracking-widest text-black/45">Булангийн радиус</label>
                <div className="flex gap-2">
                  {["none", "sm", "md", "lg", "full"].map((r) => (
                    <button
                      key={r}
                      onClick={() => updateBrand("borderRadius", r)}
                      className={`h-10 flex-1 rounded-xl border border-black/8 text-xs font-bold uppercase tracking-widest transition ${
                        template.defaultBrand?.borderRadius === r
                          ? "bg-black text-white"
                          : "bg-[#fafafa] text-black/60 hover:bg-black/5"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !template.name}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-black py-5 text-sm font-bold text-white transition hover:scale-[1.02] active:scale-100 disabled:opacity-50 disabled:hover:scale-100"
        >
          <SaveOutlined />
          {saving ? "Хадгалж байна..." : "Загварыг хадгалах"}
        </button>
      </div>

      {/* Preview Area */}
      <div className="flex-1 group relative overflow-hidden rounded-[2.5rem] border border-black/10 bg-white shadow-inner">
        <div className="absolute inset-0 overflow-y-auto">
          <ThemeProvider config={currentThemeConfig}>
            <MenuRenderer 
              restaurant={previewRestaurant}
              menu={MOCK_MENU}
              showAddButton={false}
            />
          </ThemeProvider>
        </div>
        
        <div className="absolute right-6 top-6 z-40 pointer-events-none">
          <div className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
            <LayoutOutlined className="text-sm" />
            Live Preview
          </div>
        </div>
      </div>
    </div>
  );
}
