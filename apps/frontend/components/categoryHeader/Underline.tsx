import type { CategoryHeaderProps } from "@qr-menu/shared-types";

export default function Underline({ category }: CategoryHeaderProps) {
  return (
    <div className="space-y-3">
      <h2 className="font-display text-3xl text-ink">{category.name}</h2>
      <div
        className="h-[3px] w-24 rounded-full"
        style={{
          background:
            "linear-gradient(90deg, var(--color-primary), color-mix(in srgb, var(--color-accent) 70%, var(--color-primary) 30%))",
        }}
      />
    </div>
  );
}
