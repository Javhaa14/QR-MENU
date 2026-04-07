"use client";

import { useEffect, useMemo, useState } from "react";

import { SaveOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  ColorPicker,
  Empty,
  Input,
  Select,
  Statistic,
  Switch,
  Tag,
  Typography,
} from "antd";

import type {
  BrandConfig,
  Menu,
  MenuItem,
  Restaurant,
  SlotName,
  Template,
  ThemeConfig,
} from "@qr-menu/shared-types";

import {
  EditableMenuPreview,
  type PendingItemState,
} from "@/components/admin/EditableMenuPreview";
import { apiFetch } from "@/lib/api";
import { getSlotVariants } from "@/lib/componentRegistry";
import { getRestaurantAdminContext, getSuperadminContext } from "@/lib/portal";
import {
  DEFAULT_BRAND,
  DEFAULT_THEME,
  FONT_OPTIONS,
  SLOT_LABELS,
  getSlotVariantLabel,
  mergeThemeConfig,
  sanitizeThemeConfig,
} from "@/lib/theme";

const { Text, Title, Paragraph } = Typography;

type StudioMode = "superadmin" | "restaurant_admin";

function parseList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function resolveStudioContext(mode: StudioMode) {
  return mode === "superadmin"
    ? getSuperadminContext()
    : getRestaurantAdminContext();
}

function resolveStudioPaths(mode: StudioMode, restaurantId?: string) {
  const context = resolveStudioContext(mode);

  if (!context) {
    return null;
  }

  const resolvedRestaurantId =
    mode === "superadmin" ? restaurantId : context.restaurantId;

  if (!resolvedRestaurantId) {
    return null;
  }

  return {
    token: context.token,
    restaurantId: resolvedRestaurantId,
    restaurantPath:
      mode === "superadmin"
        ? `/restaurants/${resolvedRestaurantId}`
        : "/restaurants/me",
    themePath:
      mode === "superadmin"
        ? `/restaurants/${resolvedRestaurantId}/theme`
        : "/restaurants/me/theme",
    brandPath:
      mode === "superadmin"
        ? `/restaurants/${resolvedRestaurantId}/brand`
        : "/restaurants/me/brand",
    templatePath:
      mode === "superadmin"
        ? `/restaurants/${resolvedRestaurantId}/template`
        : "/restaurants/me/template",
    menusPath: `/restaurants/${resolvedRestaurantId}/menus`,
    templatesPath: "/templates",
  };
}

function getStudioCopy(mode: StudioMode) {
  if (mode === "superadmin") {
    return {
      eyebrow: "Нэгдсэн студи",
      title: "Загвар ба Меню",
      description:
        "Загварын бүтэц (Template) сонгож, брэндийн өнгө төрхийг тохируулна. Бодит меню Preview дээр контентыг шууд засварлана.",
    };
  }

  return {
    eyebrow: "Рестораны студи",
    title: "Дизайн ба меню удирдлага",
    description:
      "1-рт Загвараа сонгоно, 2-рт Өөрийн брэнд өнгө төрхийг өгнө. Сүүлчийн алхамд меню контентоо Preview дээрээсээ шууд засварлаарай.",
  };
}

function normalizeRequestError(
  requestError: unknown,
  fallback: string,
) {
  if (!(requestError instanceof Error)) {
    return fallback;
  }

  if (requestError.message === "Forbidden resource") {
    return "Энэ үйлдлийг хийх эрх хүрэхгүй байна.";
  }

  return requestError.message;
}

export function RestaurantStudio({
  mode,
  restaurantId,
}: {
  mode: StudioMode;
  restaurantId?: string;
}) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menu, setMenu] = useState<Menu | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
  const [activeStep, setActiveStep] = useState<"template" | "brand">("template");
  const [loading, setLoading] = useState(true);
  const [savingTheme, setSavingTheme] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = getStudioCopy(mode);

  useEffect(() => {
    const timer = statusMessage
      ? window.setTimeout(() => setStatusMessage(null), 2400)
      : null;

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [statusMessage]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const paths = resolveStudioPaths(mode, restaurantId);

      if (!paths) {
        if (!cancelled) {
          setError("Нэвтрэлт эсвэл рестораны мэдээлэл олдсонгүй.");
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);

        const [restaurantResponse, menuResponse, templatesResponse] = await Promise.all([
          apiFetch<Restaurant>(paths.restaurantPath, {
            token: paths.token,
          }),
          apiFetch<Menu[]>(paths.menusPath, {
            token: paths.token,
          }),
          apiFetch<Template[]>(paths.templatesPath, {
            token: paths.token,
          }),
        ]);

        if (cancelled) {
          return;
        }

        const nextTheme = sanitizeThemeConfig(restaurantResponse.themeConfig);

        setRestaurant({
          ...restaurantResponse,
          themeConfig: nextTheme,
        });
        setTheme(nextTheme);
        setMenu(menuResponse[0] ?? null);
        setTemplates(templatesResponse);
        
        if (restaurantResponse.templateId) {
          setActiveStep("brand");
        }

        setError(null);
      } catch (requestError) {
        if (!cancelled) {
          setError(
            normalizeRequestError(
              requestError,
              "Студийн мэдээллийг ачаалж чадсангүй.",
            ),
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [mode, restaurantId]);

  const previewRestaurant = useMemo(() => {
    return restaurant ? { ...restaurant, themeConfig: theme } : null;
  }, [restaurant, theme]);

  const itemCount = useMemo(() => {
    return (
      menu?.categories.reduce(
        (count, category) => count + category.items.length,
        0,
      ) ?? 0
    );
  }, [menu]);

  function updateBrandProperty(
    key: keyof BrandConfig,
    value: string | boolean,
  ) {
    setTheme((current) => ({
      ...current,
      [key]: value,
    }));
  }

  async function selectTemplate(template: Template) {
    const paths = resolveStudioPaths(mode, restaurantId);
    if (!paths) return;

    try {
      setLoading(true);
      const updatedRestaurant = await apiFetch<Restaurant>(paths.templatePath, {
        token: paths.token,
        method: "PATCH",
        body: { templateId: template._id },
      });

      const nextTheme = sanitizeThemeConfig(updatedRestaurant.themeConfig);
      setRestaurant({
        ...updatedRestaurant,
        themeConfig: nextTheme,
      });
      setTheme(nextTheme);
      setActiveStep("brand");
      setStatusMessage(`"${template.name}" загвар амжилттай сонгогдлоо.`);
    } catch (requestError) {
      setError(normalizeRequestError(requestError, "Загвар сольж чадсангүй."));
    } finally {
      setLoading(false);
    }
  }

  async function saveBrand() {
    const paths = resolveStudioPaths(mode, restaurantId);
    if (!paths) return;

    setSavingTheme(true);
    setError(null);

    const brandData: BrandConfig = {
      primary: theme.primary,
      bg: theme.bg,
      text: theme.text,
      accent: theme.accent,
      font: theme.font,
      borderRadius: theme.borderRadius,
      darkMode: theme.darkMode,
      showImages: theme.showImages,
      heroImage: theme.heroImage,
    };

    try {
      const updatedRestaurant = await apiFetch<Restaurant>(paths.brandPath, {
        token: paths.token,
        method: "PATCH",
        body: brandData,
      });

      const nextTheme = sanitizeThemeConfig(updatedRestaurant.themeConfig);
      setRestaurant({
        ...updatedRestaurant,
        themeConfig: nextTheme,
      });
      setTheme(nextTheme);
      setStatusMessage("Брэндийн тохиргоо хадгалагдлаа.");
    } catch (requestError) {
      setError(normalizeRequestError(requestError, "Хадгалж чадсангүй."));
    } finally {
      setSavingTheme(false);
    }
  }

  function applyMenuResponse(nextMenu: Menu) {
    setMenu(nextMenu);
  }

  async function addCategory(name: string) {
    const paths = resolveStudioPaths(mode, restaurantId);

    if (!paths || !menu?._id || !name.trim()) {
      return;
    }

    const updatedMenu = await apiFetch<Menu>(
      `${paths.menusPath}/${menu._id}/categories`,
      {
        token: paths.token,
        method: "POST",
        body: { name: name.trim() },
      },
    );

    applyMenuResponse(updatedMenu);
    setStatusMessage("Ангилал нэмэгдлээ.");
  }

  async function saveCategory(
    categoryId: string,
    category: Menu["categories"][number],
  ) {
    const paths = resolveStudioPaths(mode, restaurantId);
    if (!paths || !menu?._id) return;

    const updatedMenu = await apiFetch<Menu>(
      `${paths.menusPath}/${menu._id}/categories/${categoryId}`,
      {
        token: paths.token,
        method: "PATCH",
        body: {
          name: category.name,
          position: category.position ?? 0,
        },
      },
    );

    applyMenuResponse(updatedMenu);
    setStatusMessage("Ангиллын өөрчлөлт хадгалагдлаа.");
  }

  async function deleteCategory(categoryId: string) {
    const paths = resolveStudioPaths(mode, restaurantId);
    if (!paths || !menu?._id) return;

    const updatedMenu = await apiFetch<Menu>(
      `${paths.menusPath}/${menu._id}/categories/${categoryId}`,
      {
        token: paths.token,
        method: "DELETE",
      },
    );

    applyMenuResponse(updatedMenu);
    setStatusMessage("Ангилал устлаа.");
  }

  async function addItem(categoryId: string, draft: PendingItemState) {
    const paths = resolveStudioPaths(mode, restaurantId);
    if (!paths || !menu?._id) return;

    if (!draft.name.trim() || !draft.price.trim()) {
      setError("Хоолны нэр болон үнийг бөглөнө үү.");
      return;
    }

    const updatedMenu = await apiFetch<Menu>(
      `${paths.menusPath}/${menu._id}/categories/${categoryId}/items`,
      {
        token: paths.token,
        method: "POST",
        body: {
          name: draft.name.trim(),
          description: draft.description.trim(),
          price: Number(draft.price),
          currency: draft.currency || "MNT",
          image: draft.image || undefined,
          tags: parseList(draft.tags),
          allergens: parseList(draft.allergens),
          isAvailable: draft.isAvailable,
        },
      },
    );

    applyMenuResponse(updatedMenu);
    setStatusMessage("Шинэ хоол нэмэгдлээ.");
  }

  async function saveItem(
    categoryId: string,
    item: Menu["categories"][number]["items"][number],
  ) {
    const paths = resolveStudioPaths(mode, restaurantId);
    if (!paths || !menu?._id || !item._id) return;

    const updatedMenu = await apiFetch<Menu>(
      `${paths.menusPath}/${menu._id}/categories/${categoryId}/items/${item._id}`,
      {
        token: paths.token,
        method: "PATCH",
        body: {
          name: item.name,
          description: item.description,
          price: item.price,
          currency: item.currency,
          image: item.image,
          tags: item.tags,
          allergens: item.allergens,
          isAvailable: item.isAvailable,
        },
      },
    );

    applyMenuResponse(updatedMenu);
    setStatusMessage("Хоолны өөрчлөлт хадгалагдлаа.");
  }

  async function deleteItem(categoryId: string, itemId?: string) {
    const paths = resolveStudioPaths(mode, restaurantId);
    if (!paths || !menu?._id || !itemId) return;

    const updatedMenu = await apiFetch<Menu>(
      `${paths.menusPath}/${menu._id}/categories/${categoryId}/items/${itemId}`,
      {
        token: paths.token,
        method: "DELETE",
      },
    );

    applyMenuResponse(updatedMenu);
    setStatusMessage("Хоол устлаа.");
  }

  async function uploadImage(file: File) {
    const paths = resolveStudioPaths(mode, restaurantId);
    if (!paths) throw new Error("Нэвтрэлтийн мэдээлэл олдсонгүй.");

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiFetch<{ url: string }>("/upload/image", {
      token: paths.token,
      method: "POST",
      body: formData,
    });

    return response.url;
  }

  async function runMenuAction(action: () => Promise<void>) {
    try {
      setError(null);
      await action();
    } catch (requestError) {
      setError(normalizeRequestError(requestError, "Үйлдлийг гүйцэтгэж чадсангүй."));
    }
  }

  return (
    <section className="grid gap-6 text-[#111111]">
      {/* Header card remains as modified in previous step */}
      <Card className="!rounded-[2rem] shadow-[0_18px_50px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <Text className="!text-xs !font-semibold !uppercase !tracking-[0.26em] !text-black/45">
              {copy.eyebrow}
            </Text>
            <Title
              level={1}
              className="!mb-0 !mt-3 !font-display !text-4xl !text-black md:!text-5xl"
            >
              {restaurant?.name ?? "Ресторан"}
            </Title>
            
            <div className="mt-6 flex flex-wrap gap-2">
              <Button 
                type={activeStep === "template" ? "primary" : "default"}
                onClick={() => setActiveStep("template")}
                className="!rounded-full"
              >
                1. Загвар сонгох
              </Button>
              <Button 
                type={activeStep === "brand" ? "primary" : "default"}
                onClick={() => setActiveStep("brand")}
                className="!rounded-full"
                disabled={!restaurant?.templateId && activeStep === "template"}
              >
                2. Дизайн & Меню
              </Button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Card size="small" className="!rounded-[1.35rem] !bg-[#fafafa]">
              <Statistic title="Ангилал" value={menu?.categories.length ?? 0} />
            </Card>
            <Card size="small" className="!rounded-[1.35rem] !bg-[#fafafa]">
              <Statistic title="Хоол" value={itemCount} />
            </Card>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="large"
              loading={savingTheme}
              disabled={activeStep === "template"}
              onClick={() => void saveBrand()}
              className="!h-full !min-h-[88px] !rounded-[1.35rem]"
            >
              {savingTheme ? "Хадгалж байна..." : "Өөрчлөлтийг хадгалах"}
            </Button>
          </div>
        </div>
      </Card>

      {statusMessage && (
        <Alert type="success" showIcon message={statusMessage} className="!rounded-[1.3rem]" />
      )}
      {error && (
        <Alert type="error" showIcon message={error} className="!rounded-[1.3rem]" />
      )}

      {loading ? (
        <Card className="!rounded-[1.7rem]">
          <div className="py-16 text-center text-sm text-black/55">Студийг бэлдэж байна...</div>
        </Card>
      ) : activeStep === "template" ? (
        <div className="grid gap-6">
          <Title level={3} className="!font-display !mb-0">Загварын сан</Title>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl) => (
              <Card
                key={tpl._id}
                hoverable
                className={`!rounded-[1.5rem] overflow-hidden border-2 transition-all ${
                  restaurant?.templateId === tpl._id ? "border-[#c06b3e] shadow-lg" : "border-transparent"
                }`}
                cover={<img alt={tpl.name} src={tpl.thumbnail} className="h-48 object-cover" />}
                onClick={() => selectTemplate(tpl)}
              >
                <Card.Meta 
                  title={<div className="flex items-center justify-between">
                    <span>{tpl.name}</span>
                    {restaurant?.templateId === tpl._id && <Tag color="orange">Сонгосон</Tag>}
                  </div>}
                  description={tpl.description} 
                />
              </Card>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="h-fit !rounded-[1.7rem] xl:sticky xl:top-4">
             <div className="flex items-center justify-between gap-3">
              <div>
                <Text className="!text-[10px] !font-bold !uppercase !tracking-[0.2em] !text-black/40">
                  Брэнд тохиргоо
                </Text>
                <Title level={4} className="!mb-0 !mt-1 !font-display !text-black">
                  Өнгө төрх
                </Title>
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              {(
                [
                  ["primary", "Үндсэн өнгө", theme.primary],
                  ["bg", "Арын өнгө", theme.bg],
                  ["text", "Текстийн өнгө", theme.text],
                  ["accent", "Акцент өнгө", theme.accent],
                ] as const
              ).map(([key, label, value]) => (
                <label key={key} className="grid gap-2">
                  <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/45">
                    {label}
                  </Text>
                  <div className="flex items-center gap-3">
                    <ColorPicker
                      value={value}
                      onChangeComplete={(nextColor) =>
                        updateBrandProperty(key, nextColor.toHexString())
                      }
                    />
                    <Input
                      value={value}
                      onChange={(event) =>
                        updateBrandProperty(key, event.target.value)
                      }
                      size="large"
                    />
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/45">
                  Фонт
                </Text>
                <Select
                  value={theme.font}
                  onChange={(value) => updateBrandProperty("font", value)}
                  options={FONT_OPTIONS.map((font) => ({ label: font, value: font }))}
                  size="large"
                />
              </label>

              <label className="grid gap-2">
                <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/45">
                  Булангийн хэлбэр
                </Text>
                <Select
                  value={theme.borderRadius}
                  onChange={(value) => updateBrandProperty("borderRadius", value)}
                  options={[
                    { label: "Тэгш", value: "none" },
                    { label: "Бага", value: "sm" },
                    { label: "Дунд", value: "md" },
                    { label: "Зөөлөн", value: "lg" },
                    { label: "Бүрэн дугуй", value: "full" },
                  ]}
                  size="large"
                />
              </label>
            </div>

            <div className="mt-6 grid gap-3">
              <div className="flex items-center justify-between rounded-[1.1rem] border border-black/8 bg-[#fafafa] px-4 py-2">
                <Text className="!text-sm !text-black/70">Зураг харуулах</Text>
                <Switch
                  checked={theme.showImages}
                  onChange={(checked) => updateBrandProperty("showImages", checked)}
                />
              </div>

              <div className="flex items-center justify-between rounded-[1.1rem] border border-black/8 bg-[#fafafa] px-4 py-2">
                <Text className="!text-sm !text-black/70">Бараан горим</Text>
                <Switch
                  checked={theme.darkMode}
                  onChange={(checked) => updateBrandProperty("darkMode", checked)}
                />
              </div>
            </div>
          </Card>

          <Card className="min-w-0 !rounded-[1.7rem] !bg-[#fcfcfb]">
            <div className="mb-5 flex flex-col gap-3 border-b border-black/8 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <Text className="!text-xs !font-semibold !uppercase !tracking-[0.24em] !text-black/45">
                  Бодит меню preview
                </Text>
                <Paragraph className="!mb-0 !mt-2 !text-sm !leading-6 !text-black/60">
                  Preview нь public menu-тэй ижил байна. Ангилал эсвэл item дээр дарж засварлана.
                </Paragraph>
              </div>
            </div>

            {previewRestaurant && menu ? (
              <EditableMenuPreview
                restaurant={previewRestaurant}
                menu={menu}
                onAddCategory={(name) => runMenuAction(() => addCategory(name))}
                onSaveCategory={(categoryId, category) => runMenuAction(() => saveCategory(categoryId, category))}
                onDeleteCategory={(categoryId) => runMenuAction(() => deleteCategory(categoryId))}
                onAddItem={(categoryId, draft) => runMenuAction(() => addItem(categoryId, draft))}
                onSaveItem={(categoryId, item) => runMenuAction(() => saveItem(categoryId, item))}
                onDeleteItem={(categoryId, itemId) => runMenuAction(() => deleteItem(categoryId, itemId))}
                onUploadImage={uploadImage}
              />
            ) : (
              <Empty description="Урьдчилсан харагдац ачаалж чадсангүй." />
            )}
          </Card>
        </div>
      )}
    </section>
  );
}
