"use client";

import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";

type Product = {
  slug: string;
  name: string;
  pricePerPiece: number;
  price6Pack: number;
  price12Pack: number;
  isEggless: boolean;
  containsDairy: boolean;
  containsNuts: boolean;
};

export function ProductEditor() {
  const [products, setProducts] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/products", { cache: "no-store" });
    const d = await r.json();
    setProducts(d.products || []);
  }

  useEffect(() => {
    load();
  }, []);

  function update(slug: string, patch: Partial<Product>) {
    setProducts((prev) => prev.map((p) => (p.slug === slug ? { ...p, ...patch } : p)));
  }

  async function save() {
    setSaving(true);
    await fetch("/api/admin/products", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ products })
    });
    setSaving(false);
    load();
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold">Edit pricing & labels</div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button>
      </div>

      <div className="mt-4 grid gap-4">
        {products.map((p) => (
          <div key={p.slug} className="rounded-2xl border border-black/10 p-4">
            <div className="font-extrabold">{p.name}</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Field label="Per piece (cents)">
                <Input
                  value={p.pricePerPiece}
                  onChange={(e) => update(p.slug, { pricePerPiece: Number(e.target.value || 0) })}
                />
              </Field>
              <Field label="6-pack (cents)">
                <Input value={p.price6Pack} onChange={(e) => update(p.slug, { price6Pack: Number(e.target.value || 0) })} />
              </Field>
              <Field label="12-pack (cents)">
                <Input value={p.price12Pack} onChange={(e) => update(p.slug, { price12Pack: Number(e.target.value || 0) })} />
              </Field>
            </div>

            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.isEggless} onChange={(e) => update(p.slug, { isEggless: e.target.checked })} />
                Eggless
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.containsDairy} onChange={(e) => update(p.slug, { containsDairy: e.target.checked })} />
                Contains Dairy
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={p.containsNuts} onChange={(e) => update(p.slug, { containsNuts: e.target.checked })} />
                Contains Nuts
              </label>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold text-neutral-600">{label}</div>
      {children}
    </div>
  );
}