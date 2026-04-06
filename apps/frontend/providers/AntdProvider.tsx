"use client";

import type { ReactNode } from "react";

import { App, ConfigProvider } from "antd";

export function AntdProvider({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 18,
          colorPrimary: "#111827",
          colorInfo: "#111827",
          colorSuccess: "#1677ff",
          fontFamily: "var(--font-body)",
        },
        components: {
          Button: {
            borderRadius: 999,
            controlHeight: 42,
          },
          Card: {
            borderRadiusLG: 24,
          },
          Input: {
            borderRadius: 14,
          },
          InputNumber: {
            borderRadius: 14,
          },
          Select: {
            borderRadius: 14,
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  );
}
