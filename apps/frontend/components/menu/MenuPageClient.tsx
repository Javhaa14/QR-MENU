"use client";

import { useEffect } from "react";

import type { Menu, Restaurant } from "@qr-menu/shared-types";

import { useCart } from "@/providers/CartProvider";

import { MenuRenderer } from "./MenuRenderer";

export function MenuPageClient({
  restaurant,
  menu,
  slug,
  initialTableNumber,
}: {
  restaurant: Restaurant;
  menu: Menu;
  slug: string;
  initialTableNumber?: string;
}) {
  const { addItem, tableNumber, setTableNumber } = useCart();

  useEffect(() => {
    if (initialTableNumber && !tableNumber) {
      setTableNumber(initialTableNumber);
    }
  }, [initialTableNumber, setTableNumber, tableNumber]);

  return (
    <MenuRenderer
      restaurant={restaurant}
      menu={menu}
      onAdd={addItem}
      slug={slug}
      showCartBar
    />
  );
}
