"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

import type { Template } from "@qr-menu/shared-types";
import { apiFetch } from "@/lib/api";
import { getSuperadminContext } from "@/lib/portal";

export default function TemplateManagementPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadTemplates() {
    const context = getSuperadminContext();
    if (!context) return;

    setLoading(true);
    try {
      const response = await apiFetch<Template[]>("/templates/admin", {
        token: context.token,
      });
      setTemplates(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Загваруудыг ачаалж чадсангүй.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadTemplates();
  }, []);

  async function deleteTemplate(id: string) {
    if (!confirm("Энэ загварыг устгахдаа итгэлтэй байна уу?")) return;

    const context = getSuperadminContext();
    if (!context) return;

    try {
      await apiFetch(`/templates/${id}`, {
        token: context.token,
        method: "DELETE",
      });
      await loadTemplates();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Загварыг устгаж чадсангүй.");
    }
  }

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold text-[#231810]">
            Загварын сан
          </h1>
          <p className="mt-1 text-black/55">
            Системд байгаа бүх цэсний бүтцийн загваруудыг эндээс удирдана.
          </p>
        </div>
        <Link
          href="/superadmin/templates/new"
          className="flex items-center gap-2 rounded-2xl bg-black px-6 py-4 text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-100"
        >
          <PlusOutlined />
          Загвар нэмэх
        </Link>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-[2rem] bg-black/5" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template._id}
              className="group overflow-hidden rounded-[2rem] border border-black/10 bg-white shadow-[0_12px_30px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
            >
              <div className="relative aspect-video overflow-hidden bg-black/5">
                {template.thumbnail ? (
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-black/20 text-4xl">
                    <PlusOutlined />
                  </div>
                )}
                {!template.active && (
                  <div className="absolute inset-0 grid place-items-center bg-black/40 backdrop-blur-sm">
                    <span className="rounded-full bg-white/20 px-4 py-1 text-xs font-semibold text-white backdrop-blur-md">
                      Идэвхгүй
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold text-[#231810]">
                      {template.name}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-black/55">
                      {template.description}
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center gap-2">
                  <Link
                    href={`/superadmin/templates/${template._id}`}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#fafafa] py-3 text-sm font-semibold text-black transition hover:bg-black hover:text-white"
                  >
                    <EditOutlined />
                    Засах
                  </Link>
                  <button
                    onClick={() => deleteTemplate(template._id!)}
                    className="grid h-11 w-11 place-items-center rounded-xl bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
