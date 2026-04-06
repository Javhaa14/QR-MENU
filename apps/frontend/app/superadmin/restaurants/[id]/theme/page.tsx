"use client";

import { useParams } from "next/navigation";

import { RestaurantStudio } from "@/components/admin/RestaurantStudio";

export default function RestaurantThemePage() {
  const params = useParams<{ id: string }>();

  return <RestaurantStudio mode="superadmin" restaurantId={String(params.id ?? "")} />;
}
