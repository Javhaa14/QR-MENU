"use client";

import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { Menu, MenuItem, Restaurant } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { formatCurrency } from "@/lib/format";
import { getSuperadminContext } from "@/lib/portal";

type PendingItemState = {
  name: string;
  description: string;
  price: string;
  currency: string;
  image: string;
  tags: string;
  allergens: string;
  isAvailable: boolean;
};

function createPendingItemState(): PendingItemState {
  return {
    name: "",
    description: "",
    price: "",
    currency: "USD",
    image: "",
    tags: "",
    allergens: "",
    isAvailable: true,
  };
}

function parseList(value: string) {
  return value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export default function SuperadminRestaurantMenuPage() {
  const params = useParams<{ id: string }>();
  const restaurantId = String(params.id ?? "");
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [newMenuName, setNewMenuName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [pendingItems, setPendingItems] = useState<Record<string, PendingItemState>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  async function loadData() {
    const context = getSuperadminContext();

    if (!context || !restaurantId) {
      return;
    }

    try {
      const [restaurantResponse, menuResponse] = await Promise.all([
        apiFetch<Restaurant>(`/restaurants/${restaurantId}`, {
          token: context.token,
        }),
        apiFetch<Menu[]>(`/restaurants/${restaurantId}/menus`, {
          token: context.token,
        }),
      ]);

      setRestaurant(restaurantResponse);
      setMenus(menuResponse);
      setSelectedMenuId((current) => {
        if (current && menuResponse.some((menu) => menu._id === current)) {
          return current;
        }

        return menuResponse.find((menu) => menu.isActive)?._id ?? menuResponse[0]?._id ?? null;
      });
      setError(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load the menu editor.",
      );
    }
  }

  useEffect(() => {
    void loadData();
  }, [restaurantId]);

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu._id === selectedMenuId) ?? null,
    [menus, selectedMenuId],
  );

  function updateLocalCategory(
    menuId: string,
    categoryId: string,
    changes: Partial<Menu["categories"][number]>,
  ) {
    setMenus((current) =>
      current.map((menu) =>
        menu._id === menuId
          ? {
              ...menu,
              categories: menu.categories.map((category) =>
                category._id === categoryId
                  ? { ...category, ...changes }
                  : category,
              ),
            }
          : menu,
      ),
    );
  }

  function updateLocalItem(
    menuId: string,
    categoryId: string,
    itemId: string,
    changes: Partial<MenuItem>,
  ) {
    setMenus((current) =>
      current.map((menu) =>
        menu._id === menuId
          ? {
              ...menu,
              categories: menu.categories.map((category) =>
                category._id === categoryId
                  ? {
                      ...category,
                      items: category.items.map((item) =>
                        item._id === itemId ? { ...item, ...changes } : item,
                      ),
                    }
                  : category,
              ),
            }
          : menu,
      ),
    );
  }

  function updatePendingItem(
    categoryId: string,
    changes: Partial<PendingItemState>,
  ) {
    setPendingItems((current) => ({
      ...current,
      [categoryId]: {
        ...(current[categoryId] ?? createPendingItemState()),
        ...changes,
      },
    }));
  }

  async function runMenuAction(action: () => Promise<void>) {
    try {
      setError(null);
      await action();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to complete the menu action.",
      );
    }
  }

  async function createMenu() {
    const context = getSuperadminContext();

    if (!context || !newMenuName.trim()) {
      return;
    }

    await apiFetch(`/restaurants/${restaurantId}/menus`, {
      token: context.token,
      method: "POST",
      body: { name: newMenuName },
    });

    setNewMenuName("");
    await loadData();
  }

  async function activateMenu(menuId: string) {
    const context = getSuperadminContext();

    if (!context) {
      return;
    }

    await apiFetch(`/restaurants/${restaurantId}/menus/${menuId}/activate`, {
      token: context.token,
      method: "PATCH",
    });
    await loadData();
  }

  async function addCategory() {
    const context = getSuperadminContext();

    if (!context || !selectedMenu?._id || !newCategoryName.trim()) {
      return;
    }

    await apiFetch(`/restaurants/${restaurantId}/menus/${selectedMenu._id}/categories`, {
      token: context.token,
      method: "POST",
      body: { name: newCategoryName },
    });

    setNewCategoryName("");
    await loadData();
  }

  async function saveCategory(categoryId: string, category: Menu["categories"][number]) {
    const context = getSuperadminContext();

    if (!context || !selectedMenu?._id) {
      return;
    }

    await apiFetch(
      `/restaurants/${restaurantId}/menus/${selectedMenu._id}/categories/${categoryId}`,
      {
        token: context.token,
        method: "PATCH",
        body: {
          name: category.name,
          position: category.position ?? 0,
        },
      },
    );

    await loadData();
  }

  async function deleteCategory(categoryId: string) {
    const context = getSuperadminContext();

    if (!context || !selectedMenu?._id) {
      return;
    }

    await apiFetch(
      `/restaurants/${restaurantId}/menus/${selectedMenu._id}/categories/${categoryId}`,
      {
        token: context.token,
        method: "DELETE",
      },
    );

    await loadData();
  }

  async function addItem(categoryId: string) {
    const context = getSuperadminContext();

    if (!context || !selectedMenu?._id) {
      return;
    }

    const draft = pendingItems[categoryId] ?? createPendingItemState();

    if (!draft.name.trim() || !draft.price.trim()) {
      return;
    }

    await apiFetch(
      `/restaurants/${restaurantId}/menus/${selectedMenu._id}/categories/${categoryId}/items`,
      {
        token: context.token,
        method: "POST",
        body: {
          name: draft.name,
          description: draft.description,
          price: Number(draft.price),
          currency: draft.currency,
          image: draft.image || undefined,
          tags: parseList(draft.tags),
          allergens: parseList(draft.allergens),
          isAvailable: draft.isAvailable,
        },
      },
    );

    setPendingItems((current) => ({
      ...current,
      [categoryId]: createPendingItemState(),
    }));

    await loadData();
  }

  async function saveItem(
    categoryId: string,
    item: Menu["categories"][number]["items"][number],
  ) {
    const context = getSuperadminContext();

    if (!context || !selectedMenu?._id || !item._id) {
      return;
    }

    await apiFetch(
      `/restaurants/${restaurantId}/menus/${selectedMenu._id}/categories/${categoryId}/items/${item._id}`,
      {
        token: context.token,
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

    await loadData();
  }

  async function toggleAvailability(categoryId: string, itemId?: string) {
    const context = getSuperadminContext();

    if (!context || !selectedMenu?._id || !itemId) {
      return;
    }

    await apiFetch(
      `/restaurants/${restaurantId}/menus/${selectedMenu._id}/categories/${categoryId}/items/${itemId}/toggle`,
      {
        token: context.token,
        method: "PATCH",
      },
    );

    await loadData();
  }

  async function deleteItem(categoryId: string, itemId?: string) {
    const context = getSuperadminContext();

    if (!context || !selectedMenu?._id || !itemId) {
      return;
    }

    await apiFetch(
      `/restaurants/${restaurantId}/menus/${selectedMenu._id}/categories/${categoryId}/items/${itemId}`,
      {
        token: context.token,
        method: "DELETE",
      },
    );

    await loadData();
  }

  async function uploadImage(file: File) {
    const context = getSuperadminContext();

    if (!context) {
      throw new Error("Missing superadmin session.");
    }

    const formData = new FormData();
    formData.append("file", file);

    const response = await apiFetch<{ url: string }>("/upload/image", {
      token: context.token,
      method: "POST",
      body: formData,
    });

    return response.url;
  }

  async function handleDraftImageUpload(categoryId: string, file?: File) {
    if (!file) {
      return;
    }

    setUploadingKey(`draft-${categoryId}`);

    try {
      const imageUrl = await uploadImage(file);
      updatePendingItem(categoryId, { image: imageUrl });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to upload the image.",
      );
    } finally {
      setUploadingKey(null);
    }
  }

  async function handleExistingImageUpload(
    menuId: string,
    categoryId: string,
    itemId: string,
    file?: File,
  ) {
    if (!file) {
      return;
    }

    setUploadingKey(itemId);

    try {
      const imageUrl = await uploadImage(file);
      updateLocalItem(menuId, categoryId, itemId, { image: imageUrl });
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to upload the image.",
      );
    } finally {
      setUploadingKey(null);
    }
  }

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-[#f8f1e7] p-6 shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Menu Editor
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          {restaurant?.name ?? "Restaurant"} menus
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-black/60">
          Build categories, edit items, upload imagery, and control which menu is
          currently public.
        </p>
      </header>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/8 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="rounded-[1.7rem] border border-black/10 bg-[#231810] p-5 text-white shadow-velvet">
          <div className="grid gap-3">
            <input
              value={newMenuName}
              onChange={(event) => setNewMenuName(event.target.value)}
              placeholder="New menu name"
              className="rounded-[1rem] border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/45"
            />
            <button
              type="button"
              onClick={() => void runMenuAction(createMenu)}
              className="rounded-full border border-white/10 px-4 py-3 text-sm"
            >
              Create menu
            </button>
          </div>

          <div className="mt-6 grid gap-3">
            {menus.map((menu) => {
              const active = menu._id === selectedMenuId;

              return (
                <button
                  key={menu._id}
                  type="button"
                  onClick={() => setSelectedMenuId(menu._id ?? null)}
                  className="rounded-[1.2rem] border px-4 py-4 text-left"
                  style={{
                    borderColor: active ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.08)",
                    background: active ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.04)",
                  }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">{menu.name}</p>
                      <p className="text-xs text-white/45">
                        {menu.categories.length} categories
                      </p>
                    </div>
                    {menu.isActive ? (
                      <span className="rounded-full bg-emerald-400/16 px-3 py-1 text-[11px] text-emerald-200">
                        Active
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="grid gap-6">
          {selectedMenu ? (
            <>
              <div className="rounded-[1.7rem] border border-black/10 bg-white/75 p-6 shadow-velvet">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-black/45">
                      Selected menu
                    </p>
                    <h2 className="mt-2 font-display text-4xl text-[#231810]">
                      {selectedMenu.name}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      void runMenuAction(() => activateMenu(selectedMenu._id ?? ""))
                    }
                    className="rounded-full bg-[#231810] px-5 py-3 text-sm font-semibold text-white"
                  >
                    {selectedMenu.isActive ? "Active now" : "Activate menu"}
                  </button>
                </div>

                <div className="mt-6 flex flex-col gap-3 md:flex-row">
                  <input
                    value={newCategoryName}
                    onChange={(event) => setNewCategoryName(event.target.value)}
                    placeholder="New category name"
                    className="flex-1 rounded-[1rem] border border-black/10 bg-white px-4 py-3 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => void runMenuAction(addCategory)}
                    className="rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white"
                  >
                    Add category
                  </button>
                </div>
              </div>

              <div className="grid gap-4">
                {selectedMenu.categories.map((category) => {
                  const categoryId = category._id ?? "";
                  const draft = pendingItems[categoryId] ?? createPendingItemState();

                  return (
                    <article
                      key={category._id}
                      className="rounded-[1.7rem] border border-black/10 bg-white/75 p-5 shadow-velvet"
                    >
                      <div className="grid gap-3 lg:grid-cols-[1fr_140px_auto] lg:items-center">
                        <input
                          value={category.name}
                          onChange={(event) =>
                            updateLocalCategory(selectedMenu._id ?? "", categoryId, {
                              name: event.target.value,
                            })
                          }
                          className="rounded-[1rem] border border-black/10 bg-white px-4 py-3 text-lg font-medium outline-none"
                        />
                        <input
                          type="number"
                          value={category.position ?? 0}
                          onChange={(event) =>
                            updateLocalCategory(selectedMenu._id ?? "", categoryId, {
                              position: Number(event.target.value),
                            })
                          }
                          className="rounded-[1rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                        />
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void runMenuAction(() => saveCategory(categoryId, category))
                            }
                            className="rounded-full border border-black/10 px-4 py-2 text-sm"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              void runMenuAction(() => deleteCategory(categoryId))
                            }
                            className="rounded-full border border-red-500/20 px-4 py-2 text-sm text-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <div className="mt-5 grid gap-4">
                        {category.items.map((item) => {
                          const itemId = item._id ?? "";
                          const isUploading = uploadingKey === itemId;

                          return (
                            <div
                              key={itemId}
                              className="rounded-[1.2rem] border border-black/10 bg-white p-4"
                            >
                              <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr_220px]">
                                <div className="grid gap-3">
                                  <input
                                    value={item.name}
                                    onChange={(event) =>
                                      updateLocalItem(
                                        selectedMenu._id ?? "",
                                        categoryId,
                                        itemId,
                                        { name: event.target.value },
                                      )
                                    }
                                    className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 outline-none"
                                  />
                                  <textarea
                                    value={item.description ?? ""}
                                    onChange={(event) =>
                                      updateLocalItem(
                                        selectedMenu._id ?? "",
                                        categoryId,
                                        itemId,
                                        { description: event.target.value },
                                      )
                                    }
                                    placeholder="Description"
                                    rows={3}
                                    className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                                  />
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <input
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      value={item.price}
                                      onChange={(event) =>
                                        updateLocalItem(
                                          selectedMenu._id ?? "",
                                          categoryId,
                                          itemId,
                                          { price: Number(event.target.value || 0) },
                                        )
                                      }
                                      className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 outline-none"
                                    />
                                    <input
                                      value={item.currency}
                                      onChange={(event) =>
                                        updateLocalItem(
                                          selectedMenu._id ?? "",
                                          categoryId,
                                          itemId,
                                          { currency: event.target.value },
                                        )
                                      }
                                      className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                                    />
                                  </div>
                                  <input
                                    value={item.image ?? ""}
                                    onChange={(event) =>
                                      updateLocalItem(
                                        selectedMenu._id ?? "",
                                        categoryId,
                                        itemId,
                                        { image: event.target.value },
                                      )
                                    }
                                    placeholder="Image URL"
                                    className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                                  />
                                  <div className="grid gap-3 md:grid-cols-2">
                                    <input
                                      value={item.tags.join(", ")}
                                      onChange={(event) =>
                                        updateLocalItem(
                                          selectedMenu._id ?? "",
                                          categoryId,
                                          itemId,
                                          { tags: parseList(event.target.value) },
                                        )
                                      }
                                      placeholder="Tags: vegan, spicy"
                                      className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                                    />
                                    <input
                                      value={item.allergens.join(", ")}
                                      onChange={(event) =>
                                        updateLocalItem(
                                          selectedMenu._id ?? "",
                                          categoryId,
                                          itemId,
                                          { allergens: parseList(event.target.value) },
                                        )
                                      }
                                      placeholder="Allergens: nuts, gluten"
                                      className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                                    />
                                  </div>
                                </div>

                                <div className="grid gap-3">
                                  {item.image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                      src={item.image}
                                      alt={item.name}
                                      className="aspect-[4/3] w-full rounded-[1rem] border border-black/10 bg-[#faf5ef] object-cover"
                                    />
                                  ) : (
                                    <div className="grid aspect-[4/3] place-items-center rounded-[1rem] border border-dashed border-black/10 bg-[#faf5ef] text-sm text-black/45">
                                      No image yet
                                    </div>
                                  )}
                                  <label className="grid gap-2 text-sm text-black/60">
                                    <span>Upload image</span>
                                    <input
                                      type="file"
                                      accept="image/*"
                                      onChange={(event) =>
                                        void handleExistingImageUpload(
                                          selectedMenu._id ?? "",
                                          categoryId,
                                          itemId,
                                          event.target.files?.[0],
                                        )
                                      }
                                      className="rounded-[0.95rem] border border-black/10 bg-white px-3 py-2 text-sm"
                                    />
                                  </label>
                                  <label className="inline-flex items-center gap-3 rounded-[0.95rem] border border-black/10 bg-[#faf5ef] px-4 py-3 text-sm text-black/65">
                                    <input
                                      type="checkbox"
                                      checked={item.isAvailable}
                                      onChange={(event) =>
                                        updateLocalItem(
                                          selectedMenu._id ?? "",
                                          categoryId,
                                          itemId,
                                          { isAvailable: event.target.checked },
                                        )
                                      }
                                    />
                                    Available
                                  </label>
                                  <p className="text-sm text-black/55">
                                    {formatCurrency(item.price, item.currency)}
                                  </p>
                                  {isUploading ? (
                                    <p className="text-xs text-black/45">
                                      Uploading image...
                                    </p>
                                  ) : null}
                                </div>

                                <div className="grid gap-2 self-start">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void runMenuAction(() => saveItem(categoryId, item))
                                    }
                                    className="rounded-full bg-[#231810] px-4 py-2 text-sm font-semibold text-white"
                                  >
                                    Save item
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void runMenuAction(() =>
                                        toggleAvailability(categoryId, item._id),
                                      )
                                    }
                                    className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/65"
                                  >
                                    {item.isAvailable ? "Disable quickly" : "Enable quickly"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      void runMenuAction(() =>
                                        deleteItem(categoryId, item._id),
                                      )
                                    }
                                    className="rounded-full border border-red-500/20 px-4 py-2 text-sm text-red-700"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-5 grid gap-3 rounded-[1.2rem] border border-dashed border-black/10 bg-[#faf5ef] p-4 xl:grid-cols-[1fr_1fr_220px]">
                        <div className="grid gap-3">
                          <input
                            value={draft.name}
                            onChange={(event) =>
                              updatePendingItem(categoryId, { name: event.target.value })
                            }
                            placeholder="New item name"
                            className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 outline-none"
                          />
                          <textarea
                            value={draft.description}
                            onChange={(event) =>
                              updatePendingItem(categoryId, {
                                description: event.target.value,
                              })
                            }
                            placeholder="Description"
                            rows={3}
                            className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                          />
                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={draft.price}
                              onChange={(event) =>
                                updatePendingItem(categoryId, { price: event.target.value })
                              }
                              placeholder="Price"
                              className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 outline-none"
                            />
                            <input
                              value={draft.currency}
                              onChange={(event) =>
                                updatePendingItem(categoryId, {
                                  currency: event.target.value,
                                })
                              }
                              className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                            />
                          </div>
                          <input
                            value={draft.image}
                            onChange={(event) =>
                              updatePendingItem(categoryId, { image: event.target.value })
                            }
                            placeholder="Image URL"
                            className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                          />
                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              value={draft.tags}
                              onChange={(event) =>
                                updatePendingItem(categoryId, { tags: event.target.value })
                              }
                              placeholder="Tags"
                              className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                            />
                            <input
                              value={draft.allergens}
                              onChange={(event) =>
                                updatePendingItem(categoryId, {
                                  allergens: event.target.value,
                                })
                              }
                              placeholder="Allergens"
                              className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid gap-3">
                          {draft.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={draft.image}
                              alt="Draft preview"
                              className="aspect-[4/3] w-full rounded-[1rem] border border-black/10 bg-white object-cover"
                            />
                          ) : (
                            <div className="grid aspect-[4/3] place-items-center rounded-[1rem] border border-dashed border-black/10 bg-white text-sm text-black/45">
                              Draft image preview
                            </div>
                          )}
                          <label className="grid gap-2 text-sm text-black/60">
                            <span>Upload image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(event) =>
                                void handleDraftImageUpload(
                                  categoryId,
                                  event.target.files?.[0],
                                )
                              }
                              className="rounded-[0.95rem] border border-black/10 bg-white px-3 py-2 text-sm"
                            />
                          </label>
                          <label className="inline-flex items-center gap-3 rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm text-black/65">
                            <input
                              type="checkbox"
                              checked={draft.isAvailable}
                              onChange={(event) =>
                                updatePendingItem(categoryId, {
                                  isAvailable: event.target.checked,
                                })
                              }
                            />
                            Available immediately
                          </label>
                          {uploadingKey === `draft-${categoryId}` ? (
                            <p className="text-xs text-black/45">Uploading image...</p>
                          ) : null}
                        </div>

                        <div className="grid gap-2 self-start">
                          <button
                            type="button"
                            onClick={() => void runMenuAction(() => addItem(categoryId))}
                            className="rounded-full bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white"
                          >
                            Add item
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setPendingItems((current) => ({
                                ...current,
                                [categoryId]: createPendingItemState(),
                              }))
                            }
                            className="rounded-full border border-black/10 px-4 py-2 text-sm text-black/65"
                          >
                            Clear draft
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-[1.7rem] border border-dashed border-black/10 bg-white/70 px-6 py-16 text-center text-sm text-black/55">
              Create the first menu to start adding categories and items.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
