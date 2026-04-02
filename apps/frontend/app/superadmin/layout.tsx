import type { ReactNode } from "react";

import { SuperadminLayoutClient } from "@/components/superadmin/SuperadminLayoutClient";

export default function SuperadminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <SuperadminLayoutClient>{children}</SuperadminLayoutClient>;
}
