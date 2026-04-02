import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto flex max-w-5xl flex-col gap-12">
        <section className="grid gap-10 rounded-[2rem] border border-black/10 bg-white/60 p-10 shadow-velvet lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.24em] text-black/45">
              QR Menu System
            </p>
            <h1 className="max-w-2xl font-display text-5xl leading-tight text-ink md:text-6xl">
              Menus that feel bespoke, orders that land instantly.
            </h1>
            <p className="max-w-xl text-base leading-8 text-black/65">
              This monorepo ships a themed public menu, tenant-aware NestJS API,
              QR generation, uploads, and a live kitchen board powered by
              Socket.IO.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/admin/login"
                className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white shadow-lg shadow-black/10"
              >
                Open Admin
              </Link>
              <Link
                href="/menu/demo"
                className="rounded-full border border-black/10 px-6 py-3 text-sm font-medium text-ink"
              >
                Preview Menu Route
              </Link>
            </div>
          </div>
          <div className="grid gap-4 rounded-[1.75rem] bg-black/[0.04] p-5">
            {[
              "Next.js 14 App Router",
              "NestJS + MongoDB",
              "WebSocket order board",
              "Theme slot registry",
            ].map((item) => (
              <div
                key={item}
                className="rounded-[1.3rem] border border-black/10 bg-white/70 px-5 py-4 text-sm text-black/70"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
