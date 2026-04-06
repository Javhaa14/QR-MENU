"use client";

import { useRouter } from "next/navigation";

export function PortalBackButton({
  fallbackHref,
  label = "Буцах",
}: {
  fallbackHref: string;
  label?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }

        router.push(fallbackHref);
      }}
      className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/80 px-4 py-2 text-sm font-medium text-black/70 shadow-sm transition hover:bg-white"
    >
      <span aria-hidden="true">←</span>
      <span>{label}</span>
    </button>
  );
}
