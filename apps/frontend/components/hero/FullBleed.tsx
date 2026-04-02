import type { HeroProps } from "@qr-menu/shared-types";

export default function FullBleed({ restaurant }: HeroProps) {
  return (
    <section
      className="overflow-hidden rounded-[calc(var(--radius)+1rem)] border border-black/10 text-white shadow-velvet"
      style={{
        backgroundImage: restaurant.themeConfig.heroImage
          ? `linear-gradient(135deg, rgba(0,0,0,0.66), rgba(0,0,0,0.22)), url(${restaurant.themeConfig.heroImage})`
          : "linear-gradient(135deg, color-mix(in srgb, var(--color-primary) 82%, black 18%), color-mix(in srgb, var(--color-accent) 58%, black 42%))",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex min-h-[300px] flex-col justify-end gap-5 px-6 py-8 md:min-h-[360px] md:px-10 md:py-12">
        <div className="inline-flex w-fit rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/80">
          Scan. Browse. Order.
        </div>
        <div className="max-w-2xl space-y-4">
          <h1 className="font-display text-4xl leading-tight md:text-6xl">
            {restaurant.name}
          </h1>
          <p className="max-w-lg text-sm leading-7 text-white/76 md:text-base">
            A living digital menu with real-time updates, designed to feel like
            its own brand instead of a generic template.
          </p>
        </div>
      </div>
    </section>
  );
}
