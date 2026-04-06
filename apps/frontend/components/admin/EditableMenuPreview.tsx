"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
  type KeyboardEvent,
  type ReactNode,
} from "react";

import {
  App,
  Button,
  Empty,
  Input,
  InputNumber,
  Modal,
  Switch,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  MobileOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";

import type {
  CategoryHeaderProps,
  CategoryNavProps,
  FooterProps,
  HeroProps,
  ItemCardProps,
  Menu,
  MenuItem,
  Restaurant,
} from "@qr-menu/shared-types";

import Banner from "@/components/categoryHeader/Banner";
import ScrollTabs from "@/components/categoryNav/ScrollTabs";
import MinimalFooter from "@/components/footer/Minimal";
import FullBleedHero from "@/components/hero/FullBleed";
import ImageTop from "@/components/itemCard/ImageTop";
import { resolveComponent } from "@/lib/componentRegistry";
import { MenuTopBar } from "@/components/menu/MenuTopBar";
import { ThemeProvider } from "@/providers/ThemeProvider";

const { Text, Title, Paragraph } = Typography;
const { TextArea } = Input;

export type PendingItemState = {
  name: string;
  description: string;
  price: string;
  currency: string;
  image: string;
  tags: string;
  allergens: string;
  isAvailable: boolean;
};

interface EditableMenuPreviewProps {
  restaurant: Restaurant;
  menu: Menu;
  onAddCategory: (name: string) => Promise<void>;
  onSaveCategory: (
    categoryId: string,
    category: Menu["categories"][number],
  ) => Promise<void>;
  onDeleteCategory: (categoryId: string) => Promise<void>;
  onAddItem: (categoryId: string, draft: PendingItemState) => Promise<void>;
  onSaveItem: (
    categoryId: string,
    item: Menu["categories"][number]["items"][number],
  ) => Promise<void>;
  onDeleteItem: (categoryId: string, itemId?: string) => Promise<void>;
  onUploadImage: (file: File) => Promise<string>;
}

interface ResolvedSlots {
  Hero: ComponentType<HeroProps>;
  CategoryNav: ComponentType<CategoryNavProps>;
  ItemCard: ComponentType<ItemCardProps>;
  CategoryHeader: ComponentType<CategoryHeaderProps>;
  Footer: ComponentType<FooterProps>;
}

interface CategoryModalState {
  mode: "create" | "edit";
  categoryId?: string;
  name: string;
}

interface ItemModalState {
  mode: "create" | "edit";
  categoryId: string;
  itemId?: string;
  draft: PendingItemState;
}

const defaultSlots: ResolvedSlots = {
  Hero: FullBleedHero,
  CategoryNav: ScrollTabs,
  ItemCard: ImageTop,
  CategoryHeader: Banner,
  Footer: MinimalFooter,
};

function createEmptyDraft(): PendingItemState {
  return {
    name: "",
    description: "",
    price: "",
    currency: "MNT",
    image: "",
    tags: "",
    allergens: "",
    isAvailable: true,
  };
}

function toDraft(item: MenuItem): PendingItemState {
  return {
    name: item.name,
    description: item.description ?? "",
    price: String(item.price),
    currency: item.currency || "MNT",
    image: item.image ?? "",
    tags: (item.tags ?? []).join(", "),
    allergens: (item.allergens ?? []).join(", "),
    isAvailable: item.isAvailable,
  };
}

function parseList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function toMenuItem(original: MenuItem, draft: PendingItemState): MenuItem {
  return {
    ...original,
    name: draft.name.trim(),
    description: draft.description.trim(),
    price: Number(draft.price || 0),
    currency: draft.currency || "MNT",
    image: draft.image.trim(),
    tags: parseList(draft.tags),
    allergens: parseList(draft.allergens),
    isAvailable: draft.isAvailable,
  };
}

function runOnEnter(event: KeyboardEvent<HTMLElement>, handler: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    handler();
  }
}

function PhonePreviewFrame({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[430px]">
      <div className="rounded-[30px] border border-black/8 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
        <div className="mx-auto w-full max-w-[393px]">
          <div className="rounded-[34px] bg-[#0f172a] p-2.5 shadow-[0_28px_70px_rgba(15,23,42,0.26)]">
            <div
              className="relative overflow-hidden rounded-[28px] bg-[var(--color-bg)]"
              style={{ aspectRatio: "393 / 786" }}
            >
              <div className="pointer-events-none absolute left-1/2 top-2 z-20 h-6 w-32 -translate-x-1/2 rounded-full bg-[#0f172a]/96" />
              <div className="h-full overflow-y-auto">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditableMenuPreview({
  restaurant,
  menu,
  onAddCategory,
  onSaveCategory,
  onDeleteCategory,
  onAddItem,
  onSaveItem,
  onDeleteItem,
  onUploadImage,
}: EditableMenuPreviewProps) {
  const { modal, message } = App.useApp();
  const [slots, setSlots] = useState<ResolvedSlots>(defaultSlots);
  const [activeCategoryId, setActiveCategoryId] = useState<string | undefined>(
    menu.categories[0]?._id,
  );
  const [categoryModal, setCategoryModal] = useState<CategoryModalState | null>(
    null,
  );
  const [itemModal, setItemModal] = useState<ItemModalState | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    setActiveCategoryId((current) => {
      if (menu.categories.length === 0) {
        return undefined;
      }

      if (
        current &&
        menu.categories.some((category) => category._id === current)
      ) {
        return current;
      }

      return menu.categories[0]?._id;
    });
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
          resolveComponent(
            "itemCard",
            restaurant.themeConfig.components.itemCard,
          ),
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
    return restaurant.themeConfig.components.itemCard === "minimalList"
      ? "grid gap-3"
      : "grid gap-4";
  }, [restaurant.themeConfig.components.itemCard]);
  const featuredItem = useMemo(
    () =>
      menu.categories
        .flatMap((category) => category.items)
        .find((item) => item.isAvailable && item.image) ??
      menu.categories
        .flatMap((category) => category.items)
        .find((item) => item.isAvailable),
    [menu.categories],
  );

  function handleCategorySelect(categoryId: string) {
    setActiveCategoryId(categoryId);
    document
      .getElementById(`studio-category-${categoryId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function jumpToElement(id?: string) {
    if (!id) {
      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function openCreateCategoryModal() {
    setCategoryModal({
      mode: "create",
      name: "",
    });
  }

  function openEditCategoryModal(category: Menu["categories"][number]) {
    setCategoryModal({
      mode: "edit",
      categoryId: category._id,
      name: category.name,
    });
  }

  function openCreateItemModal(categoryId: string) {
    setItemModal({
      mode: "create",
      categoryId,
      draft: createEmptyDraft(),
    });
  }

  function openEditItemModal(categoryId: string, item: MenuItem) {
    setItemModal({
      mode: "edit",
      categoryId,
      itemId: item._id,
      draft: toDraft(item),
    });
  }

  async function submitCategoryModal() {
    if (!categoryModal || !categoryModal.name.trim()) {
      return;
    }

    setSavingCategory(true);

    try {
      if (categoryModal.mode === "create") {
        await onAddCategory(categoryModal.name.trim());
      } else {
        const category = menu.categories.find(
          (entry) => entry._id === categoryModal.categoryId,
        );

        if (!category || !categoryModal.categoryId) {
          return;
        }

        await onSaveCategory(categoryModal.categoryId, {
          ...category,
          name: categoryModal.name.trim(),
        });
      }

      setCategoryModal(null);
    } finally {
      setSavingCategory(false);
    }
  }

  async function submitItemModal() {
    if (
      !itemModal ||
      !itemModal.draft.name.trim() ||
      !itemModal.draft.price.trim()
    ) {
      return;
    }

    setSavingItem(true);

    try {
      if (itemModal.mode === "create") {
        await onAddItem(itemModal.categoryId, itemModal.draft);
      } else {
        const category = menu.categories.find(
          (entry) => entry._id === itemModal.categoryId,
        );
        const item = category?.items.find(
          (entry) => entry._id === itemModal.itemId,
        );

        if (!category || !item) {
          return;
        }

        await onSaveItem(
          itemModal.categoryId,
          toMenuItem(item, itemModal.draft),
        );
      }

      setItemModal(null);
    } finally {
      setSavingItem(false);
    }
  }

  async function confirmDeleteCategory(categoryId: string) {
    await modal.confirm({
      title: "Ангилал устгах уу?",
      content: "Энэ ангилал болон доторх бүх item устна.",
      okText: "Устгах",
      cancelText: "Болих",
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => onDeleteCategory(categoryId),
    });
  }

  async function confirmDeleteItem(categoryId: string, itemId?: string) {
    await modal.confirm({
      title: "Menu item устгах уу?",
      content: "Энэ item менюнээс бүр мөсөн устна.",
      okText: "Устгах",
      cancelText: "Болих",
      okButtonProps: { danger: true },
      centered: true,
      onOk: () => onDeleteItem(categoryId, itemId),
    });
  }

  async function uploadModalImage(file: File) {
    setUploadingImage(true);

    try {
      const imageUrl = await onUploadImage(file);
      setItemModal((current) =>
        current
          ? {
              ...current,
              draft: {
                ...current.draft,
                image: imageUrl,
              },
            }
          : current,
      );
      message.success("Зураг upload хийгдлээ.");
    } catch (requestError) {
      message.error(
        requestError instanceof Error
          ? requestError.message
          : "Зургийг upload хийж чадсангүй.",
      );
    } finally {
      setUploadingImage(false);
    }
  }

  return (
    <ThemeProvider config={restaurant.themeConfig}>
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-black/10 bg-white px-4 py-3 shadow-[0_16px_40px_rgba(15,23,42,0.05)]">
          <div>
            <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/40">
              Real Menu Preview
            </Text>
            <div className="mt-1 flex items-center gap-2">
              <MobileOutlined className="text-black/55" />
              <Title level={4} className="!mb-0 !text-black">
                Public menu style, modal edit only
              </Title>
            </div>
            <Paragraph className="!mb-0 !mt-2 !text-sm !text-black/58">
              Category эсвэл item дээр дарж засна. Ил харагдах ялгаа нь зөвхөн
              жижиг action button-ууд байна.
            </Paragraph>
          </div>

          <Tooltip title="Ангилал нэмэх">
            <Button
              type="primary"
              shape="circle"
              icon={<PlusOutlined />}
              onClick={openCreateCategoryModal}
              aria-label="Ангилал нэмэх"
            />
          </Tooltip>
        </div>

        <PhonePreviewFrame>
          <main className="min-h-full">
            <div className="mx-auto flex w-full max-w-[393px] flex-col px-4 pb-6">
              <MenuTopBar
                restaurant={restaurant}
                viewportMode="mobile"
                onMenuClick={() => jumpToElement("studio-category-nav")}
                onSearchClick={() =>
                  jumpToElement(
                    featuredItem
                      ? "studio-featured"
                      : activeCategoryId
                        ? `studio-category-${activeCategoryId}`
                        : undefined,
                  )
                }
              />

              <div className="flex flex-col gap-8 pt-5">
                <div id="studio-featured">
                  <slots.Hero
                    restaurant={restaurant}
                    featuredItem={featuredItem}
                    viewportMode="mobile"
                  />
                </div>

                {menu.categories.length > 0 ? (
                  <div id="studio-category-nav">
                    <slots.CategoryNav
                      categories={menu.categories}
                      activeCategoryId={activeCategoryId}
                      onSelect={handleCategorySelect}
                    />
                  </div>
                ) : null}

                {menu.categories.length > 0 ? (
                  <div className="grid gap-10">
                    {menu.categories.map((category) => {
                      const categoryId = category._id ?? "";

                      return (
                        <section
                          key={categoryId}
                          id={`studio-category-${categoryId}`}
                          className="scroll-mt-36 space-y-5"
                        >
                          <div className="flex justify-end gap-2">
                            <Tooltip title="Item нэмэх">
                              <Button
                                size="small"
                                shape="circle"
                                icon={<PlusOutlined />}
                                onClick={() => openCreateItemModal(categoryId)}
                                aria-label="Item нэмэх"
                              />
                            </Tooltip>
                            <Tooltip title="Ангилал устгах">
                              <Button
                                size="small"
                                shape="circle"
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() =>
                                  void confirmDeleteCategory(categoryId)
                                }
                                aria-label="Ангилал устгах"
                              />
                            </Tooltip>
                          </div>

                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => openEditCategoryModal(category)}
                            onKeyDown={(event) =>
                              runOnEnter(event, () =>
                                openEditCategoryModal(category),
                              )
                            }
                            className="cursor-pointer rounded-[var(--radius)] transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20"
                          >
                            <slots.CategoryHeader category={category} />
                          </div>

                          <div className={gridClassName}>
                            {category.items.length > 0 ? (
                              category.items.map((item) => (
                                <article
                                  key={item._id}
                                  className="group relative"
                                >
                                  <div className="absolute right-2 top-2 z-20 flex items-center gap-2">
                                    {!item.isAvailable ? (
                                      <Tag className="!m-0 !rounded-full !border-0 !bg-white/88 !px-2 !text-[11px] !text-black/62">
                                        Hidden
                                      </Tag>
                                    ) : null}

                                    <Tooltip title="Засах">
                                      <Button
                                        size="small"
                                        shape="circle"
                                        icon={<EditOutlined />}
                                        className="!border-white/70 !bg-white/88 !shadow-sm backdrop-blur"
                                        onClick={() =>
                                          openEditItemModal(categoryId, item)
                                        }
                                        aria-label="Засах"
                                      />
                                    </Tooltip>

                                    <Tooltip title="Устгах">
                                      <Button
                                        size="small"
                                        shape="circle"
                                        danger
                                        icon={<DeleteOutlined />}
                                        className="!shadow-sm"
                                        onClick={() =>
                                          void confirmDeleteItem(
                                            categoryId,
                                            item._id,
                                          )
                                        }
                                        aria-label="Устгах"
                                      />
                                    </Tooltip>
                                  </div>

                                  <div
                                    role="button"
                                    tabIndex={0}
                                    onClick={() =>
                                      openEditItemModal(categoryId, item)
                                    }
                                    onKeyDown={(event) =>
                                      runOnEnter(event, () =>
                                        openEditItemModal(categoryId, item),
                                      )
                                    }
                                    className={`cursor-pointer transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 ${
                                      item.isAvailable ? "" : "opacity-60"
                                    }`}
                                  >
                                    <slots.ItemCard
                                      item={item}
                                      showAddButton={false}
                                      viewportMode="mobile"
                                    />
                                  </div>
                                </article>
                              ))
                            ) : (
                              <div className="rounded-[var(--radius)] border border-dashed border-black/12 bg-white/55 px-4 py-8 text-center text-sm text-black/45">
                                Энэ ангилалд item алга байна.
                              </div>
                            )}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-[var(--radius)] border border-dashed border-black/12 bg-white/60 px-4 py-12">
                    <Empty description="Одоогоор ангилал алга байна." />
                  </div>
                )}

                <slots.Footer restaurant={restaurant} viewportMode="mobile" />
              </div>
            </div>
          </main>
        </PhonePreviewFrame>

        <Modal
          open={categoryModal !== null}
          title={
            categoryModal?.mode === "create" ? "Шинэ ангилал" : "Ангилал засах"
          }
          okText={categoryModal?.mode === "create" ? "Нэмэх" : "Хадгалах"}
          cancelText="Болих"
          onCancel={() => setCategoryModal(null)}
          onOk={() => void submitCategoryModal()}
          confirmLoading={savingCategory}
          centered
        >
          <div className="grid gap-2">
            <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/40">
              Ангиллын нэр
            </Text>
            <Input
              value={categoryModal?.name ?? ""}
              onChange={(event) =>
                setCategoryModal((current) =>
                  current
                    ? {
                        ...current,
                        name: event.target.value,
                      }
                    : current,
                )
              }
              placeholder="Жишээ нь: Ундаа"
              size="large"
            />
          </div>
        </Modal>

        <Modal
          open={itemModal !== null}
          title={itemModal?.mode === "create" ? "Шинэ item" : "Menu item засах"}
          okText={itemModal?.mode === "create" ? "Нэмэх" : "Хадгалах"}
          cancelText="Болих"
          onCancel={() => setItemModal(null)}
          onOk={() => void submitItemModal()}
          confirmLoading={savingItem}
          centered
          width={640}
        >
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/40">
                Хоолны нэр
              </Text>
              <Input
                value={itemModal?.draft.name ?? ""}
                onChange={(event) =>
                  setItemModal((current) =>
                    current
                      ? {
                          ...current,
                          draft: {
                            ...current.draft,
                            name: event.target.value,
                          },
                        }
                      : current,
                  )
                }
                placeholder="Хоолны нэр"
                size="large"
              />
            </div>

            <div className="grid gap-2">
              <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/40">
                Үнэ
              </Text>
              <InputNumber
                min={0}
                value={
                  itemModal?.draft.price ? Number(itemModal.draft.price) : null
                }
                onChange={(value) =>
                  setItemModal((current) =>
                    current
                      ? {
                          ...current,
                          draft: {
                            ...current.draft,
                            price: value == null ? "" : String(value),
                            currency: "MNT",
                          },
                        }
                      : current,
                  )
                }
                addonAfter="₮"
                style={{ width: "100%" }}
                size="large"
              />
            </div>

            <div className="grid gap-2">
              <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/40">
                Тайлбар
              </Text>
              <TextArea
                value={itemModal?.draft.description ?? ""}
                onChange={(event) =>
                  setItemModal((current) =>
                    current
                      ? {
                          ...current,
                          draft: {
                            ...current.draft,
                            description: event.target.value,
                          },
                        }
                      : current,
                  )
                }
                rows={4}
                placeholder="Хоолны тайлбар"
              />
            </div>

            <div className="grid gap-2">
              <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/40">
                Зурагны URL
              </Text>
              <Input
                value={itemModal?.draft.image ?? ""}
                onChange={(event) =>
                  setItemModal((current) =>
                    current
                      ? {
                          ...current,
                          draft: {
                            ...current.draft,
                            image: event.target.value,
                          },
                        }
                      : current,
                  )
                }
                placeholder="https://..."
                size="large"
              />
            </div>

            <Upload
              accept="image/*"
              showUploadList={false}
              beforeUpload={(file) => {
                void uploadModalImage(file);
                return false;
              }}
            >
              <Button icon={<UploadOutlined />} loading={uploadingImage} block>
                {uploadingImage ? "Зураг upload хийж байна..." : "Зураг upload"}
              </Button>
            </Upload>

            <div className="grid gap-2">
              <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/40">
                Таг
              </Text>
              <Input
                value={itemModal?.draft.tags ?? ""}
                onChange={(event) =>
                  setItemModal((current) =>
                    current
                      ? {
                          ...current,
                          draft: {
                            ...current.draft,
                            tags: event.target.value,
                          },
                        }
                      : current,
                  )
                }
                placeholder="онцлох, халуун"
                size="large"
              />
            </div>

            <div className="grid gap-2">
              <Text className="!text-[11px] !font-semibold !uppercase !tracking-[0.18em] !text-black/40">
                Харшлын мэдээлэл
              </Text>
              <Input
                value={itemModal?.draft.allergens ?? ""}
                onChange={(event) =>
                  setItemModal((current) =>
                    current
                      ? {
                          ...current,
                          draft: {
                            ...current.draft,
                            allergens: event.target.value,
                          },
                        }
                      : current,
                  )
                }
                placeholder="самар, сүү"
                size="large"
              />
            </div>

            <div className="flex items-center justify-between rounded-[18px] border border-black/8 bg-[#fafafa] px-4 py-3">
              <div>
                <div className="text-sm font-medium text-black/78">
                  Зочдод харагдана
                </div>
                <div className="text-xs text-black/48">
                  Унтраавал editor дээр саарал, public menu дээр нуугдана
                </div>
              </div>
              <Switch
                checked={itemModal?.draft.isAvailable ?? true}
                onChange={(checked) =>
                  setItemModal((current) =>
                    current
                      ? {
                          ...current,
                          draft: {
                            ...current.draft,
                            isAvailable: checked,
                          },
                        }
                      : current,
                  )
                }
              />
            </div>
          </div>
        </Modal>
      </div>
    </ThemeProvider>
  );
}
