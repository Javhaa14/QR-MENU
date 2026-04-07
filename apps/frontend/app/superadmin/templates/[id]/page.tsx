"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { TemplateStudio } from "@/components/superadmin/TemplateStudio";
import { apiFetch } from "@/lib/api";
import { getSuperadminContext } from "@/lib/portal";
import type { Template } from "@qr-menu/shared-types";

interface EditTemplatePageProps {
  params: { id: string };
}

export default function EditTemplatePage({ params }: EditTemplatePageProps) {
  const router = useRouter();
  const { id } = params;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadTemplate() {
      const context = getSuperadminContext();
      if (!context) return;

      try {
        const response = await apiFetch<Template>(`/templates/${id}`, {
          token: context.token,
        });
        setTemplate(response);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Загварыг ачаалж чадсангүй.");
      } finally {
        setLoading(false);
      }
    }

    void loadTemplate();
  }, [id]);

  const handleSave = async (data: Partial<Template>) => {
    const context = getSuperadminContext();
    if (!context) return;

    try {
      await apiFetch(`/templates/${id}`, {
        token: context.token,
        method: "PATCH",
        body: data,
      });
      router.push("/superadmin/templates");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Загварыг хадгалж чадсангүй.");
    }
  };

  if (loading) {
    return (
      <div className="grid h-64 place-items-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-black" />
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-700">
        {error || "Загвар олдсонгүй."}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl">
      <TemplateStudio 
        title={`Загвар засах: ${template.name}`} 
        initialTemplate={template}
        onSave={handleSave} 
      />
    </div>
  );
}
