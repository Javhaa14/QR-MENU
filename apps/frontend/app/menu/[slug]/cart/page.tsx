import type { PublicMenuResponse } from "@qr-menu/shared-types";

import { CartPageClient } from "@/components/menu/CartPageClient";
import { serverApiFetch } from "@/lib/api";

function getTableFromSearchParams(
  value?: string | string[],
) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MenuCartPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const data = await serverApiFetch<PublicMenuResponse>(
    `/public/menu/${params.slug}`,
    {
      next: { revalidate: 60 },
    },
  );

  return (
    <CartPageClient
      restaurant={data.restaurant}
      menu={data.menu}
      slug={params.slug}
      initialTableNumber={getTableFromSearchParams(searchParams?.table)}
    />
  );
}
