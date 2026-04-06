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

import type { Menu, MenuItem, Restaurant, SlotName, ThemeConfig } from "@qr-menu/shared-types";

import {
  EditableMenuPreview,
  type PendingItemState,
} from "@/components/admin/EditableMenuPreview";
import { apiFetch } from "@/lib/api";
import { getSlotVariants } from "@/lib/componentRegistry";
import { getRestaurantAdminContext, getSuperadminContext } from "@/lib/portal";
import {
  DEFAULT_THEME,
  FONT_OPTIONS,
  SLOT_LABELS,
  getSlotVariantLabel,
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
    menusPath: `/restaurants/${resolvedRestaurantId}/menus`,
  };
}

function getStudioCopy(mode: StudioMode) {
  if (mode === "superadmin") {
    return {
      eyebrow: "Нэгдсэн студи",
      title: "Меню ба загварын удирдлага",
      description:
        "Рестораны өнгө, фонт, бүтэц, ангилал, хоол бүрийг нэг дэлгэц дээрээс засч, зочинд яг яаж харагдахыг бодит утасны preview дээр харна.",
    };
  }

  return {
    eyebrow: "Рестораны студи",
    title: "Бодит меню харагдац дээрээс засварлах",
    description:
      "Өөрийн рестораны загвар болон менюг нэг дороос шинэчилж, яг зочин харах меню дээр дарж modal-аар засварлана.",
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
    return "Энэ үйлдлийг хийх эрх хүрэхгүй байна. Хэрэв зураг upload хийж байсан бол backend role тохиргоог шалгана уу.";
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
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);
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

        const [restaurantResponse, menuResponse] = await Promise.all([
          apiFetch<Restaurant>(paths.restaurantPath, {
            token: paths.token,
          }),
          apiFetch<Menu[]>(paths.menusPath, {
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

  function updateThemeColor(
    key: keyof ThemeConfig["colors"],
    value: string,
  ) {
    setTheme((current) => ({
      ...current,
      colors: {
        ...current.colors,
        [key]: value,
      },
    }));
  }

  function setSlotVariant(slot: SlotName, variant: string) {
    setTheme((current) => ({
      ...current,
      components: {
        ...current.components,
        [slot]: variant,
      },
    }));
  }

  function applyMenuResponse(nextMenu: Menu) {
    setMenu(nextMenu);
  }

  async function saveTheme() {
    const paths = resolveStudioPaths(mode, restaurantId);

    if (!paths) {
      return;
    }

    setSavingTheme(true);
    setError(null);

    try {
      const updatedRestaurant = await apiFetch<Restaurant>(paths.themePath, {
        token: paths.token,
        method: "PATCH",
        body: sanitizeThemeConfig(theme),
      });

      const nextTheme = sanitizeThemeConfig(updatedRestaurant.themeConfig);

      setRestaurant({
        ...updatedRestaurant,
        themeConfig: nextTheme,
      });
      setTheme(nextTheme);
      setStatusMessage("Загвар амжилттай хадгалагдлаа.");
    } catch (requestError) {
      setError(
        normalizeRequestError(
          requestError,
          "Загварыг хадгалж чадсангүй.",
        ),
      );
    } finally {
      setSavingTheme(false);
    }
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

    if (!paths || !menu?._id) {
      return;
    }

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

    if (!paths || !menu?._id) {
      return;
    }

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

    if (!paths || !menu?._id) {
      return;
    }

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

    if (!paths || !menu?._id || !item._id) {
      return;
    }

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

    if (!paths || !menu?._id || !itemId) {
      return;
    }

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

    if (!paths) {
      throw new Error("Нэвтрэлтийн мэдээлэл олдсонгүй.");
    }

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
      setError(
        normalizeRequestError(
          requestError,
          "Үйлдлийг гүйцэтгэж чадсангүй.",
        ),
      );
    }
  }

  return (
    <section className="grid gap-6 text-[#111111]">
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
            <Title level={4} className="!mb-0 !mt-3 !text-black/72">
              {copy.title}
            </Title>
            <Paragraph className="!mb-0 !mt-4 !text-sm !leading-7 !text-black/60">
              {copy.description}
            </Paragraph>
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
              onClick={() => void saveTheme()}
              className="!h-full !min-h-[88px] !rounded-[1.35rem]"
            >
              {savingTheme ? "Загвар хадгалж байна..." : "Загварыг хадгалах"}
            </Button>
          </div>
        </div>
      </Card>

      {statusMessage ? (
        <Alert
          type="success"
          showIcon
          message={statusMessage}
          className="!rounded-[1.3rem]"
        />
      ) : null}

      {error ? (
        <Alert
          type="error"
          showIcon
          message={error}
          className="!rounded-[1.3rem]"
        />
      ) : null}

      {loading ? (
        <Card className="!rounded-[1.7rem]">
          <div className="py-16 text-center text-sm text-black/55">
            Студийг бэлдэж байна...
          </div>
        </Card>
      ) : null}

      {!loading ? (
        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="h-fit !rounded-[1.7rem] xl:sticky xl:top-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <Text className="!text-xs !font-semibold !uppercase !tracking-[0.24em] !text-black/45">
                  Дизайны тохиргоо
                </Text>
                <Title
                  level={3}
                  className="!mb-0 !mt-2 !font-display !text-black"
                >
                  Antd Studio
                </Title>
              </div>
              <Tag className="!mr-0 !rounded-full !px-3 !py-1">
                Modal edit
              </Tag>
            </div>

            <div className="mt-6 grid gap-4">
              {(
                [
                  ["primary", "Үндсэн өнгө", theme.colors.primary],
                  ["bg", "Арын өнгө", theme.colors.bg],
                  ["text", "Текстийн өнгө", theme.colors.text],
                  ["accent", "Акцент өнгө", theme.colors.accent],
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
                        updateThemeColor(key, nextColor.toHexString())
                      }
                    />
                    <Input
                      value={value}
                      onChange={(event) =>
                        updateThemeColor(key, event.target.value)
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
                  onChange={(value) =>
                    setTheme((current) => ({
                      ...current,
                      font: value,
                    }))
                  }
                  options={FONT_OPTIONS.map((font) => ({
                    label: font,
                    value: font,
                  }))}
                  size="large"
                />
              </label>

              <label className="grid gap-2">
                <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/45">
                  Булангийн хэлбэр
                </Text>
                <Select
                  value={theme.borderRadius}
                  onChange={(value) =>
                    setTheme((current) => ({
                      ...current,
                      borderRadius: value as ThemeConfig["borderRadius"],
                    }))
                  }
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
              <div className="flex items-center justify-between rounded-[1.1rem] border border-black/8 bg-[#fafafa] px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-black/78">
                    Зураг харуулах
                  </div>
                  <div className="text-xs text-black/48">
                    Public menu item зураг
                  </div>
                </div>
                <Switch
                  checked={theme.showImages ?? true}
                  onChange={(checked) =>
                    setTheme((current) => ({
                      ...current,
                      showImages: checked,
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-[1.1rem] border border-black/8 bg-[#fafafa] px-4 py-3">
                <div>
                  <div className="text-sm font-medium text-black/78">
                    Бараан горимын тэмдэглэгээ
                  </div>
                  <div className="text-xs text-black/48">
                    Theme token дээр dark flag хадгална
                  </div>
                </div>
                <Switch
                  checked={theme.darkMode ?? false}
                  onChange={(checked) =>
                    setTheme((current) => ({
                      ...current,
                      darkMode: checked,
                    }))
                  }
                />
              </div>
            </div>

            <label className="mt-6 grid gap-2">
              <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/45">
                Hero зураг
              </Text>
              <Input
                value={theme.heroImage ?? ""}
                onChange={(event) =>
                  setTheme((current) => ({
                    ...current,
                    heroImage: event.target.value,
                  }))
                }
                placeholder="https://..."
                size="large"
              />
            </label>

            <Card
              size="small"
              className="mt-6 !rounded-[1.3rem] !bg-[#fafafa]"
            >
              <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/45">
                Компонентын хувилбар
              </Text>
              <div className="mt-4 grid gap-4">
                {(Object.keys(SLOT_LABELS) as SlotName[]).map((slot) => (
                  <label key={slot} className="grid gap-2">
                    <Text className="!font-medium !text-black/78">
                      {SLOT_LABELS[slot]}
                    </Text>
                    <Select
                      value={theme.components[slot]}
                      onChange={(value) => setSlotVariant(slot, value)}
                      options={getSlotVariants(slot).map((variant) => ({
                        label: getSlotVariantLabel(slot, variant),
                        value: variant,
                      }))}
                      size="large"
                    />
                  </label>
                ))}
              </div>
            </Card>
          </Card>

          <Card className="min-w-0 !rounded-[1.7rem] !bg-[#fcfcfb]">
            <div className="mb-5 flex flex-col gap-3 border-b border-black/8 pb-5 md:flex-row md:items-center md:justify-between">
              <div>
                <Text className="!text-xs !font-semibold !uppercase !tracking-[0.24em] !text-black/45">
                  Бодит меню preview
                </Text>
                <Paragraph className="!mb-0 !mt-2 !text-sm !leading-6 !text-black/60">
                  Preview нь public menu-тэй ижил байна. Ангилал эсвэл item дээр
                  дарж modal-аар засварлана.
                </Paragraph>
              </div>

              <Tag className="!mr-0 !rounded-full !px-4 !py-2">
                {restaurant?.restaurantType === "menu_only"
                  ? "Зөвхөн меню"
                  : "Захиалгатай меню"}
              </Tag>
            </div>

            {previewRestaurant && menu ? (
              <EditableMenuPreview
                restaurant={previewRestaurant}
                menu={menu}
                onAddCategory={(name) =>
                  runMenuAction(() => addCategory(name))
                }
                onSaveCategory={(categoryId, category) =>
                  runMenuAction(() => saveCategory(categoryId, category))
                }
                onDeleteCategory={(categoryId) =>
                  runMenuAction(() => deleteCategory(categoryId))
                }
                onAddItem={(categoryId, draft) =>
                  runMenuAction(() => addItem(categoryId, draft))
                }
                onSaveItem={(categoryId, item) =>
                  runMenuAction(() => saveItem(categoryId, item))
                }
                onDeleteItem={(categoryId, itemId) =>
                  runMenuAction(() => deleteItem(categoryId, itemId))
                }
                onUploadImage={uploadImage}
              />
            ) : (
              <Empty description="Урьдчилсан харагдац ачаалж чадсангүй." />
            )}
          </Card>
        </div>
      ) : null}
    </section>
  );
}
