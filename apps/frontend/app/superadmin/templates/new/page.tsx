"use client";

import { useRouter } from "next/navigation";
import { TemplateStudio } from "@/components/superadmin/TemplateStudio";
import { apiFetch } from "@/lib/api";
import { getSuperadminContext } from "@/lib/portal";
import type { Template } from "@qr-menu/shared-types";

export default function NewTemplatePage() {
  const router = useRouter();

  const handleSave = async (data: Partial<Template>) => {
    const context = getSuperadminContext();
    if (!context) return;

    try {
      await apiFetch("/templates", {
        token: context.token,
        method: "POST",
        body: data,
      });
      router.push("/superadmin/templates");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Загварыг хадгалж чадсангүй.");
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <TemplateStudio 
        title="Шинэ загвар үүсгэх" 
        onSave={handleSave} 
      />
    </div>
  );
}
