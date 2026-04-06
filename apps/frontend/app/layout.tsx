import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AntdRegistry } from "@ant-design/nextjs-registry";

import { AntdProvider } from "@/providers/AntdProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "QR Menu",
  description: "Multi-tenant QR menu SaaS with real-time ordering.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>
          <AntdProvider>{children}</AntdProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
