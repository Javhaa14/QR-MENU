import type { HeroProps } from "@qr-menu/shared-types";

export default function Compact({
  restaurant,
  viewportMode = "responsive",
}: HeroProps) {
  const isMobile = viewportMode === "mobile";

  return (
    <section className="rounded-[calc(var(--radius)+0.75rem)] border border-black/10 bg-white/70 px-6 py-8 shadow-velvet">
      <div
        className={
          isMobile
            ? "flex flex-col gap-6"
            : "flex flex-col gap-6 md:flex-row md:items-end md:justify-between"
        }
      >
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-black/40">
            Меню
          </p>
          <h1
            className={`font-display text-ink ${
              isMobile ? "text-4xl" : "text-4xl md:text-5xl"
            }`}
          >
            {restaurant.name}
          </h1>
          <p className="max-w-xl text-sm leading-7 text-black/60">
            Рестораны өнгө төрхөд тааруулсан, амьд ажиллагааны урсгалтай
            дижитал меню.
          </p>
        </div>
        <div
          className={`h-28 rounded-[calc(var(--radius)+0.5rem)] ${
            isMobile ? "w-full" : "md:w-56"
          }`}
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 82%, transparent), color-mix(in srgb, var(--color-accent) 68%, transparent))",
          }}
        />
      </div>
    </section>
  );
}
