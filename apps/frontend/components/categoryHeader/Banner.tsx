import type { CategoryHeaderProps } from "@qr-menu/shared-types";

export default function Banner({ category }: CategoryHeaderProps) {
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/36">
        Section
      </p>
      <div className="flex items-center gap-3">
        <h2 className="font-display text-2xl font-black text-ink">
          {category.name}
        </h2>
        <div className="h-[2px] flex-1 rounded-full bg-black/8" />
      </div>
    </div>
  );
}
