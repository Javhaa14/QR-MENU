import type { PublicMenuResponse } from "@qr-menu/shared-types";

import { serverApiFetch } from "@/lib/api";
import { MenuPageClient } from "@/components/menu/MenuPageClient";

function getTableFromSearchParams(
  value?: string | string[],
) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function MenuSlugPage({
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
    <MenuPageClient
      restaurant={data.restaurant}
      menu={data.menu}
      slug={params.slug}
      initialTableNumber={getTableFromSearchParams(searchParams?.table)}
    />
  );
}
