"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { centsToUsd } from "@/lib/formatting";

type Product = {
  slug: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  imageUrl?: string | null;
  isEggless: boolean;
  containsDairy: boolean;
  containsNuts: boolean;
  pricePerPiece: number;
  price6Pack: number;
  price12Pack: number;
};

export function ProductCards() {
  const [products, setProducts] = useState<Product[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/products", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .catch(() => {});
  }, []);

  return (
    <section id="products" className="pt-10">
      <h2 className="text-2xl font-extrabold tracking-tight">Sweets</h2>
      <p className="mt-2 text-neutral-700">Two classics, made with a premium touch.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {products.map((p) => (
          <Card key={p.slug} className="overflow-hidden">
            {/* ✅ Single container, relative, correct sizing */}
            <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-maroon-50 to-saffron-50">
              <Image
                src={p.imageUrl || "/placeholder-sweet.jpg"}
                alt={p.name}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, 50vw"
                priority={false}
              />
              {/* Optional premium overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-extrabold">{p.name}</h3>
                  <p className="mt-1 text-sm text-neutral-700">{p.shortDesc}</p>
                </div>
                <div className="text-right text-sm">
                  <div className="font-semibold text-maroon-800">{centsToUsd(p.price6Pack)}</div>
                  <div className="text-xs text-neutral-500">6-pack from</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {p.isEggless && (
                  <span className="rounded-full bg-saffron-50 px-2 py-1 border border-saffron-100">
                    Eggless
                  </span>
                )}
                {p.containsDairy && (
                  <span className="rounded-full bg-white px-2 py-1 border border-black/10">
                    Contains dairy
                  </span>
                )}
                {p.containsNuts && (
                  <span className="rounded-full bg-white px-2 py-1 border border-black/10">
                    Contains nuts
                  </span>
                )}
              </div>

              <div className="mt-4">
                <button
                  className="text-sm font-semibold text-maroon-800 hover:underline"
                  onClick={() => setExpanded((e) => ({ ...e, [p.slug]: !e[p.slug] }))}
                >
                  {expanded[p.slug] ? "Hide details" : "Show details"}
                </button>
                {expanded[p.slug] && <p className="mt-2 text-sm text-neutral-700">{p.longDesc}</p>}
              </div>

              <div className="mt-5 rounded-xl border border-black/10 p-4 bg-cream">
                <div className="text-xs font-semibold text-neutral-600">Pricing (editable)</div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-lg bg-white p-2 border border-black/5">
                    <div className="text-xs text-neutral-500">Per piece</div>
                    <div className="font-semibold">{centsToUsd(p.pricePerPiece)}</div>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-black/5">
                    <div className="text-xs text-neutral-500">6-pack</div>
                    <div className="font-semibold">{centsToUsd(p.price6Pack)}</div>
                  </div>
                  <div className="rounded-lg bg-white p-2 border border-black/5">
                    <div className="text-xs text-neutral-500">12-pack</div>
                    <div className="font-semibold">{centsToUsd(p.price12Pack)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <a href="#order">
                  <Button variant="secondary" className="w-full">
                    Order this
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}