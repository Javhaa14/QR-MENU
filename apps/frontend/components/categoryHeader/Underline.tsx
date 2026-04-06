import type { CategoryHeaderProps } from "@qr-menu/shared-types";

export default function Underline({ category }: CategoryHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="font-display text-2xl font-black text-ink">
        {category.name}
      </h2>
      <div
        className="h-[2px] flex-1 rounded-full"
        style={{
          background:
            "color-mix(in srgb, var(--color-text) 10%, white 90%)",
        }}
      />
    </div>
  );
}
