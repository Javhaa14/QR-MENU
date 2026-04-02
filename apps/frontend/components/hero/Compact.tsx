import type { HeroProps } from "@qr-menu/shared-types";

export default function Compact({ restaurant }: HeroProps) {
  return (
    <section className="rounded-[calc(var(--radius)+0.75rem)] border border-black/10 bg-white/70 px-6 py-8 shadow-velvet">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-xs uppercase tracking-[0.28em] text-black/40">
            Menu
          </p>
          <h1 className="font-display text-4xl text-ink md:text-5xl">
            {restaurant.name}
          </h1>
          <p className="max-w-xl text-sm leading-7 text-black/60">
            Freshly themed for the restaurant, with the order flow connected to
            a live operations board on the back end.
          </p>
        </div>
        <div
          className="h-28 rounded-[calc(var(--radius)+0.5rem)] md:w-56"
          style={{
            background:
              "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 82%, transparent), color-mix(in srgb, var(--color-accent) 68%, transparent))",
          }}
        />
      </div>
    </section>
  );
}
