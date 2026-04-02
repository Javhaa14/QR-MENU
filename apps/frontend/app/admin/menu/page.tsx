"use client";

import { useEffect, useMemo, useState } from "react";

import type { Menu } from "@qr-menu/shared-types";

import { apiFetch } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import { formatCurrency } from "@/lib/format";

type PendingItemState = {
  name: string;
  description: string;
  price: string;
  currency: string;
};

const defaultPendingItem: PendingItemState = {
  name: "",
  description: "",
  price: "",
  currency: "USD",
};

export default function AdminMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [newMenuName, setNewMenuName] = useState("");
  const [newCategoryName, setNewCategoryName] = useState("");
  const [pendingItems, setPendingItems] = useState<Record<string, PendingItemState>>(
    {},
  );
  const [error, setError] = useState<string | null>(null);

  async function loadMenus() {
    const token = getStoredToken();
    if (!token) return;

    const data = await apiFetch<Menu[]>("/menu", { token });
    setMenus(data);
    setSelectedMenuId((current) => {
      if (current && data.some((menu) => menu._id === current)) {
        return current;
      }

      return data.find((menu) => menu.isActive)?._id ?? data[0]?._id ?? null;
    });
  }

  useEffect(() => {
    loadMenus().catch((requestError) => {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load menus.",
      );
    });
  }, []);

  const selectedMenu = useMemo(
    () => menus.find((menu) => menu._id === selectedMenuId) ?? null,
    [menus, selectedMenuId],
  );

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

  function updateLocalCategory(menuId: string, categoryId: string, name: string) {
    setMenus((current) =>
      current.map((menu) =>
        menu._id === menuId
          ? {
              ...menu,
              categories: menu.categories.map((category) =>
                category._id === categoryId ? { ...category, name } : category,
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
    field: "name" | "price" | "description" | "currency",
    value: string,
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
                        item._id === itemId
                          ? {
                              ...item,
                              [field]:
                                field === "price" ? Number(value || 0) : value,
                            }
                          : item,
                      ),
                    }
                  : category,
              ),
            }
          : menu,
      ),
    );
  }

  async function createMenu() {
    const token = getStoredToken();
    if (!token || !newMenuName.trim()) return;

    await apiFetch("/menu", {
      token,
      method: "POST",
      body: { name: newMenuName },
    });
    setNewMenuName("");
    await loadMenus();
  }

  async function activateMenu(menuId: string) {
    const token = getStoredToken();
    if (!token) return;

    await apiFetch(`/menu/${menuId}/activate`, {
      token,
      method: "PATCH",
    });
    await loadMenus();
  }

  async function addCategory() {
    const token = getStoredToken();
    if (!token || !selectedMenu?._id || !newCategoryName.trim()) return;

    await apiFetch(`/menu/${selectedMenu._id}/categories`, {
      token,
      method: "POST",
      body: { name: newCategoryName },
    });
    setNewCategoryName("");
    await loadMenus();
  }

  async function saveCategory(categoryId: string, name: string) {
    const token = getStoredToken();
    if (!token || !selectedMenu?._id) return;

    await apiFetch(`/menu/${selectedMenu._id}/categories/${categoryId}`, {
      token,
      method: "PATCH",
      body: { name },
    });
    await loadMenus();
  }

  async function deleteCategory(categoryId: string) {
    const token = getStoredToken();
    if (!token || !selectedMenu?._id) return;

    await apiFetch(`/menu/${selectedMenu._id}/categories/${categoryId}`, {
      token,
      method: "DELETE",
    });
    await loadMenus();
  }

  async function addItem(categoryId: string) {
    const token = getStoredToken();
    if (!token || !selectedMenu?._id) return;

    const draft = pendingItems[categoryId] ?? defaultPendingItem;
    if (!draft.name.trim() || !draft.price) return;

    await apiFetch(`/menu/${selectedMenu._id}/categories/${categoryId}/items`, {
      token,
      method: "POST",
      body: {
        name: draft.name,
        description: draft.description,
        price: Number(draft.price),
        currency: draft.currency,
      },
    });

    setPendingItems((current) => ({
      ...current,
      [categoryId]: defaultPendingItem,
    }));
    await loadMenus();
  }

  async function saveItem(categoryId: string, item: Menu["categories"][number]["items"][number]) {
    const token = getStoredToken();
    if (!token || !selectedMenu?._id || !item._id) return;

    await apiFetch(
      `/menu/${selectedMenu._id}/categories/${categoryId}/items/${item._id}`,
      {
        token,
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
    await loadMenus();
  }

  async function toggleAvailability(categoryId: string, itemId?: string) {
    const token = getStoredToken();
    if (!token || !selectedMenu?._id || !itemId) return;

    await apiFetch(
      `/menu/${selectedMenu._id}/categories/${categoryId}/items/${itemId}/toggle`,
      {
        token,
        method: "PATCH",
      },
    );
    await loadMenus();
  }

  async function deleteItem(categoryId: string, itemId?: string) {
    const token = getStoredToken();
    if (!token || !selectedMenu?._id || !itemId) return;

    await apiFetch(
      `/menu/${selectedMenu._id}/categories/${categoryId}/items/${itemId}`,
      {
        token,
        method: "DELETE",
      },
    );
    await loadMenus();
  }

  return (
    <section className="grid gap-6">
      <header className="rounded-[2rem] border border-black/10 bg-white/65 p-6 shadow-velvet">
        <p className="text-xs uppercase tracking-[0.24em] text-black/45">
          Menu editor
        </p>
        <h1 className="mt-3 font-display text-5xl text-[#231810]">
          Shape what guests see
        </h1>
      </header>

      {error ? (
        <div className="rounded-[1.5rem] border border-red-500/20 bg-red-500/8 px-5 py-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="rounded-[1.7rem] border border-black/10 bg-[#16120f] p-5 text-white">
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
              <div className="rounded-[1.7rem] border border-black/10 bg-white/65 p-6">
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
                    className="flex-1 rounded-[1rem] border border-black/10 bg-white/75 px-4 py-3 outline-none"
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
                {selectedMenu.categories.map((category) => (
                  <article
                    key={category._id}
                    className="rounded-[1.7rem] border border-black/10 bg-white/65 p-5"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                      <input
                        value={category.name}
                        onChange={(event) =>
                          updateLocalCategory(
                            selectedMenu._id ?? "",
                            category._id ?? "",
                            event.target.value,
                          )
                        }
                        className="flex-1 rounded-[1rem] border border-black/10 bg-white/80 px-4 py-3 text-lg font-medium outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            void runMenuAction(() =>
                              saveCategory(category._id ?? "", category.name),
                            )
                          }
                          className="rounded-full border border-black/10 px-4 py-2 text-sm"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            void runMenuAction(() =>
                              deleteCategory(category._id ?? ""),
                            )
                          }
                          className="rounded-full border border-red-500/20 px-4 py-2 text-sm text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3">
                      {category.items.map((item) => (
                        <div
                          key={item._id}
                          className="rounded-[1.1rem] border border-black/10 bg-white/78 p-4"
                        >
                          <div className="grid gap-3 md:grid-cols-[1.4fr_0.6fr_auto] md:items-start">
                            <div className="grid gap-3">
                              <input
                                value={item.name}
                                onChange={(event) =>
                                  updateLocalItem(
                                    selectedMenu._id ?? "",
                                    category._id ?? "",
                                    item._id ?? "",
                                    "name",
                                    event.target.value,
                                  )
                                }
                                className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 outline-none"
                              />
                              <input
                                value={item.description ?? ""}
                                onChange={(event) =>
                                  updateLocalItem(
                                    selectedMenu._id ?? "",
                                    category._id ?? "",
                                    item._id ?? "",
                                    "description",
                                    event.target.value,
                                  )
                                }
                                placeholder="Description"
                                className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 text-sm outline-none"
                              />
                            </div>
                            <div className="grid gap-3">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={item.price}
                                onChange={(event) =>
                                  updateLocalItem(
                                    selectedMenu._id ?? "",
                                    category._id ?? "",
                                    item._id ?? "",
                                    "price",
                                    event.target.value,
                                  )
                                }
                                className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 outline-none"
                              />
                              <p className="text-sm text-black/55">
                                {formatCurrency(item.price, item.currency)}
                              </p>
                            </div>
                            <div className="grid gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  void runMenuAction(() =>
                                    saveItem(category._id ?? "", item),
                                  )
                                }
                                className="rounded-full border border-black/10 px-4 py-2 text-sm"
                              >
                                Save
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void runMenuAction(() =>
                                    toggleAvailability(
                                      category._id ?? "",
                                      item._id,
                                    ),
                                  )
                                }
                                className="rounded-full border border-black/10 px-4 py-2 text-sm"
                              >
                                {item.isAvailable ? "Disable" : "Enable"}
                              </button>
                              <button
                                type="button"
                                onClick={() =>
                                  void runMenuAction(() =>
                                    deleteItem(category._id ?? "", item._id),
                                  )
                                }
                                className="rounded-full border border-red-500/20 px-4 py-2 text-sm text-red-700"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-5 grid gap-3 rounded-[1.1rem] border border-dashed border-black/10 bg-white/45 p-4 md:grid-cols-[1fr_1fr_0.8fr_auto]">
                      <input
                        value={(pendingItems[category._id ?? ""] ?? defaultPendingItem).name}
                        onChange={(event) =>
                          setPendingItems((current) => ({
                            ...current,
                            [category._id ?? ""]: {
                              ...(current[category._id ?? ""] ?? defaultPendingItem),
                              name: event.target.value,
                            },
                          }))
                        }
                        placeholder="Item name"
                        className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 outline-none"
                      />
                      <input
                        value={
                          (pendingItems[category._id ?? ""] ?? defaultPendingItem)
                            .description
                        }
                        onChange={(event) =>
                          setPendingItems((current) => ({
                            ...current,
                            [category._id ?? ""]: {
                              ...(current[category._id ?? ""] ?? defaultPendingItem),
                              description: event.target.value,
                            },
                          }))
                        }
                        placeholder="Description"
                        className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 outline-none"
                      />
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={(pendingItems[category._id ?? ""] ?? defaultPendingItem).price}
                        onChange={(event) =>
                          setPendingItems((current) => ({
                            ...current,
                            [category._id ?? ""]: {
                              ...(current[category._id ?? ""] ?? defaultPendingItem),
                              price: event.target.value,
                            },
                          }))
                        }
                        placeholder="Price"
                        className="rounded-[0.95rem] border border-black/10 bg-white px-4 py-3 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          void runMenuAction(() => addItem(category._id ?? ""))
                        }
                        className="rounded-full bg-[#231810] px-4 py-3 text-sm font-semibold text-white"
                      >
                        Add item
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-[1.7rem] border border-dashed border-black/10 bg-white/65 px-6 py-12 text-center text-sm text-black/55">
              Create your first menu to start editing categories and dishes.
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
