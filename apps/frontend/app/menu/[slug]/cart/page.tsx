import type { PublicMenuResponse } from "@qr-menu/shared-types";
import { redirect } from "next/navigation";

import { CartPageClient } from "@/components/menu/CartPageClient";
import { serverApiFetch } from "@/lib/api";
import { CartProvider } from "@/providers/CartProvider";

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
      cache: "no-store",
    },
  );

  if (data.restaurant.restaurantType === "menu_only") {
    redirect(`/menu/${params.slug}`);
  }

  return (
    <CartProvider>
      <CartPageClient
        restaurant={data.restaurant}
        menu={data.menu}
        slug={params.slug}
        initialTableNumber={getTableFromSearchParams(searchParams?.table)}
      />
    </CartProvider>
  );
}
