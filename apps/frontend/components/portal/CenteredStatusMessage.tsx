export function CenteredStatusMessage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f1ea] px-4">
      <section className="max-w-lg rounded-[2rem] border border-black/10 bg-white/75 p-8 text-center shadow-velvet">
        <p className="text-xs uppercase tracking-[0.26em] text-black/40">
          QR Menu
        </p>
        <h1 className="mt-4 font-display text-4xl text-[#231810]">{title}</h1>
        <p className="mt-4 text-sm leading-7 text-black/60">{description}</p>
      </section>
    </main>
  );
}
