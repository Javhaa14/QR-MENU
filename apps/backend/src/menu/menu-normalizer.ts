import type { MenuDocument } from "../database/schemas/menu.schema";

function normalizeStringArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((entry) => (typeof entry === "string" ? entry.trim() : ""))
    .filter(Boolean);
}

function arraysMatch(current: unknown, next: string[]) {
  if (!Array.isArray(current) || current.length !== next.length) {
    return false;
  }

  return current.every((entry, index) => entry === next[index]);
}

export function applyMenuDefaults(menu: MenuDocument) {
  let changed = false;

  menu.categories.forEach((category, categoryIndex) => {
    if (typeof category.name !== "string" || !category.name.trim()) {
      category.name = `Ангилал ${categoryIndex + 1}`;
      changed = true;
    }

    if (typeof category.position !== "number" || Number.isNaN(category.position)) {
      category.position = categoryIndex;
      changed = true;
    }

    category.items.forEach((item, itemIndex) => {
      if (typeof item.name !== "string" || !item.name.trim()) {
        item.name = `Хоол ${itemIndex + 1}`;
        changed = true;
      }

      if (typeof item.description !== "string") {
        item.description = "";
        changed = true;
      }

      if (typeof item.price !== "number" || Number.isNaN(item.price)) {
        item.price = 0;
        changed = true;
      }

      if (typeof item.currency !== "string" || !item.currency.trim()) {
        item.currency = "MNT";
        changed = true;
      }

      if (typeof item.image !== "string") {
        item.image = "";
        changed = true;
      }

      const nextTags = normalizeStringArray(item.tags);
      if (!arraysMatch(item.tags, nextTags)) {
        item.tags = nextTags as never;
        changed = true;
      }

      const nextAllergens = normalizeStringArray(item.allergens);
      if (!arraysMatch(item.allergens, nextAllergens)) {
        item.allergens = nextAllergens as never;
        changed = true;
      }

      if (typeof item.isAvailable !== "boolean") {
        item.isAvailable = true;
        changed = true;
      }
    });
  });

  if (changed) {
    menu.markModified("categories");
  }

  return changed;
}
