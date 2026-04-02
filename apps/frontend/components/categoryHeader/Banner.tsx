import type { CategoryHeaderProps } from "@qr-menu/shared-types";

export default function Banner({ category }: CategoryHeaderProps) {
  return (
    <div
      className="overflow-hidden rounded-[calc(var(--radius)+0.65rem)] px-5 py-4 text-white"
      style={{
        background:
          "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-accent) 72%, var(--color-primary) 28%))",
      }}
    >
      <p className="text-xs uppercase tracking-[0.28em] text-white/70">Category</p>
      <h2 className="mt-2 font-display text-3xl">{category.name}</h2>
    </div>
  );
}
