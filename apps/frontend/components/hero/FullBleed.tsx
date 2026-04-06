import type { HeroProps } from "@qr-menu/shared-types";

import { formatCurrency } from "@/lib/format";

export default function FullBleed({
  restaurant,
  featuredItem,
  viewportMode = "responsive",
}: HeroProps) {
  const isMobile = viewportMode === "mobile";
  const heroImage = featuredItem?.image || restaurant.themeConfig.heroImage;

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div className="max-w-[16rem] space-y-2">
          <p
            className="text-[11px] font-semibold uppercase tracking-[0.28em]"
            style={{
              color:
                "color-mix(in srgb, var(--color-primary) 68%, black 32%)",
            }}
          >
            Today&apos;s Picks
          </p>
          <h2
            className={`font-display font-black leading-tight ${
              isMobile ? "text-3xl" : "text-3xl md:text-4xl"
            }`}
            style={{ color: "var(--color-text)" }}
          >
            Curated for the table
          </h2>
        </div>

        <div className="rounded-full border border-black/8 bg-white/72 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/46 shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
          {restaurant.name}
        </div>
      </div>

      <article
        className={`relative overflow-hidden rounded-[calc(var(--radius)+0.5rem)] border border-black/8 shadow-[0_24px_60px_rgba(0,0,0,0.12)] ${
          isMobile ? "min-h-[400px]" : "min-h-[440px]"
        }`}
      >
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt={featuredItem?.name ?? restaurant.name}
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in srgb, var(--color-primary) 88%, black 12%), color-mix(in srgb, var(--color-accent) 52%, black 48%))",
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/24 to-transparent" />

        <div
          className={`relative flex h-full flex-col justify-end ${
            isMobile ? "p-5" : "p-5 md:p-7"
          }`}
        >
          <span className="mb-4 inline-flex w-fit rounded-full border border-white/20 bg-white/14 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/90 backdrop-blur-md">
            {featuredItem?.tags[0] ?? "Featured"}
          </span>

          <div className="space-y-4">
            <h1
              className={`max-w-[72%] font-display font-black leading-tight text-white ${
                isMobile ? "text-[1.9rem]" : "text-[1.9rem] md:text-[2.3rem]"
              }`}
            >
              {featuredItem?.name ?? restaurant.name}
            </h1>

            <div className="flex items-end justify-between gap-4">
              <p
                className={`max-w-[72%] text-white/82 ${
                  isMobile ? "text-sm leading-6" : "text-sm leading-6 md:text-base"
                }`}
              >
                {featuredItem?.description ||
                  "Seasonal signature dishes, bold plating, and a cleaner mobile-first presentation for the whole menu."}
              </p>

              {featuredItem ? (
                <span
                  className="shrink-0 rounded-full bg-white/92 px-4 py-2 font-display text-lg font-black shadow-[0_14px_28px_rgba(0,0,0,0.12)]"
                  style={{ color: "var(--color-primary)" }}
                >
                  {formatCurrency(featuredItem.price, featuredItem.currency)}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
