import type { CategoryHeaderProps } from "@qr-menu/shared-types";

export default function Minimal({ category }: CategoryHeaderProps) {
  return (
    <div className="border-b border-black/10 pb-3">
      <h2 className="font-display text-2xl text-ink">{category.name}</h2>
    </div>
  );
}
