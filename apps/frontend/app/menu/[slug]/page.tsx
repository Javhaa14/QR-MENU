import type { PublicMenuResponse } from "@qr-menu/shared-types";

import { MenuRenderer } from "@/components/menu/MenuRenderer";
import { MenuPageClient } from "@/components/menu/MenuPageClient";
import { serverApiFetch } from "@/lib/api";
import { CartProvider } from "@/providers/CartProvider";

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
      cache: "no-store",
    },
  );

  if (data.restaurant.restaurantType === "menu_only") {
    return (
      <MenuRenderer
        restaurant={data.restaurant}
        menu={data.menu}
        showAddButton={false}
      />
    );
  }

  return (
    <CartProvider>
      <MenuPageClient
        restaurant={data.restaurant}
        menu={data.menu}
        slug={params.slug}
        initialTableNumber={getTableFromSearchParams(searchParams?.table)}
      />
    </CartProvider>
  );
}
