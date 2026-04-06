import type { HeroProps } from "@qr-menu/shared-types";

export default function LogoOnly({ restaurant }: HeroProps) {
  return (
    <section className="flex flex-col items-center justify-center gap-4 rounded-[calc(var(--radius)+1rem)] border border-black/10 bg-white/65 px-6 py-12 text-center shadow-velvet">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] text-2xl font-semibold text-white"
        style={{
          background:
            "linear-gradient(135deg, var(--color-primary), color-mix(in srgb, var(--color-accent) 70%, var(--color-primary) 30%))",
        }}
      >
        {restaurant.name.slice(0, 1)}
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-4xl text-ink">{restaurant.name}</h1>
        <p className="text-sm text-black/55">Дуртай хоолоо сонгоод гал тогоо руу шууд илгээнэ үү.</p>
      </div>
    </section>
  );
}
