"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { MenuItem } from "@qr-menu/shared-types";

export interface CartEntry {
  item: MenuItem;
  quantity: number;
  note: string;
}

interface CartContextValue {
  items: CartEntry[];
  itemCount: number;
  totalPrice: number;
  tableNumber: string;
  addItem: (item: MenuItem) => void;
  updateQuantity: (menuItemId: string, quantity: number) => void;
  updateNote: (menuItemId: string, note: string) => void;
  removeItem: (menuItemId: string) => void;
  clearCart: () => void;
  setTableNumber: (tableNumber: string) => void;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartEntry[]>([]);
  const [tableNumber, setTableNumber] = useState("");

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, entry) => sum + entry.quantity, 0);
    const totalPrice = items.reduce(
      (sum, entry) => sum + entry.item.price * entry.quantity,
      0,
    );

    return {
      items,
      itemCount,
      totalPrice,
      tableNumber,
      addItem: (item) => {
        setItems((current) => {
          const existing = current.find((entry) => entry.item._id === item._id);

          if (!existing) {
            return [...current, { item, quantity: 1, note: "" }];
          }

          return current.map((entry) =>
            entry.item._id === item._id
              ? { ...entry, quantity: entry.quantity + 1 }
              : entry,
          );
        });
      },
      updateQuantity: (menuItemId, quantity) => {
        setItems((current) =>
          current
            .map((entry) =>
              entry.item._id === menuItemId
                ? { ...entry, quantity: Math.max(0, quantity) }
                : entry,
            )
            .filter((entry) => entry.quantity > 0),
        );
      },
      updateNote: (menuItemId, note) => {
        setItems((current) =>
          current.map((entry) =>
            entry.item._id === menuItemId ? { ...entry, note } : entry,
          ),
        );
      },
      removeItem: (menuItemId) => {
        setItems((current) =>
          current.filter((entry) => entry.item._id !== menuItemId),
        );
      },
      clearCart: () => setItems([]),
      setTableNumber,
    };
  }, [items, tableNumber]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider.");
  }

  return context;
}
