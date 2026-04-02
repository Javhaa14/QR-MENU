import type { ReactNode } from "react";

import { CartProvider } from "@/providers/CartProvider";

export default function MenuSlugLayout({ children }: { children: ReactNode }) {
  return <CartProvider>{children}</CartProvider>;
}
