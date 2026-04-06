import type { FooterProps } from "@qr-menu/shared-types";

export default function Full({
  restaurant,
  viewportMode = "responsive",
}: FooterProps) {
  const isMobile = viewportMode === "mobile";

  return (
    <footer className="rounded-[calc(var(--radius)+1rem)] border border-black/10 bg-black/85 px-6 py-8 text-white">
      <div className={isMobile ? "grid gap-5" : "grid gap-5 md:grid-cols-2"}>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.28em] text-white/55">Ресторан</p>
          <h3 className="font-display text-3xl">{restaurant.name}</h3>
        </div>
        <p className="text-sm leading-7 text-white/70">
          QR Menu систем дээр ажиллаж, захиалга, загвар, компонентуудыг нэг дор
          уялдуулсан дижитал орчин.
        </p>
      </div>
    </footer>
  );
}
