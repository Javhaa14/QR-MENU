import type { ReactNode } from "react";

import { RestaurantAdminLayoutClient } from "@/components/admin/RestaurantAdminLayoutClient";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RestaurantAdminLayoutClient>{children}</RestaurantAdminLayoutClient>;
}
