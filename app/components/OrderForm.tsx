"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Select } from "@/app/components/ui/Select";
import { Checkbox } from "@/app/components/ui/Checkbox";
import { Button } from "@/app/components/ui/Button";
import { centsToUsd } from "@/lib/formatting";

type Product = {
  slug: string;
  name: string;
  pricePerPiece: number;
  price6Pack: number;
  price12Pack: number;
};

type Settings = {
  serviceArea: string;
  timeWindows: { pickup: string[]; delivery: string[]; shipping: string[] };
  shippingDisclaimer: string;
};

function todayYmd() {
  const d = new Date();
  const y = d.getFullYear();
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function OrderForm() {
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [fulfillment, setFulfillment] = useState<"PICKUP" | "DELIVERY" | "SHIPPING">("PICKUP");
  const [dateYmd, setDateYmd] = useState("");
  const [timeWindow, setTimeWindow] = useState("");

  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("WA");
  const [zip, setZip] = useState("");
  const [instructions, setInstructions] = useState("");

  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "ZELLE" | "VENMO">("ZELLE");
  const [consent, setConsent] = useState(false);

  // quantities per product+pack
  const [qty, setQty] = useState<Record<string, { piece: number; ["6pack"]: number; ["12pack"]: number }>>({});

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load products + settings
  useEffect(() => {
    Promise.all([
      fetch("/api/admin/products", { cache: "no-store" }).then((r) => r.json()),
      fetch("/api/admin/settings", { cache: "no-store" }).then((r) => r.json())
    ])
      .then(([p, s]) => {
        setProducts(p.products || []);
        setSettings({
          serviceArea: s.serviceArea?.text || "Bothell • Snohomish County • Bellevue • Redmond",
          timeWindows: s.timeWindows || { pickup: ["12:00–2:00 PM"], delivery: ["2:00–5:00 PM"], shipping: ["All day"] },
          shippingDisclaimer: s.shippingDisclaimer?.text || ""
        });

        const initial: any = {};
        (p.products || []).forEach((prod: Product) => {
          initial[prod.slug] = { piece: 0, "6pack": 0, "12pack": 0 };
        });
        setQty(initial);
      })
      .catch(() => {});
  }, []);

  // Initialize date + time window from server cutoff helper
  useEffect(() => {
    fetch("/api/health", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        setDateYmd(d.nextAvailableDateLocalYmd);
      })
      .catch(() => setDateYmd(todayYmd()));
  }, []);

  // Update time window options when fulfillment changes
  useEffect(() => {
    if (!settings) return;
    const options =
      fulfillment === "PICKUP" ? settings.timeWindows.pickup : fulfillment === "DELIVERY" ? settings.timeWindows.delivery : settings.timeWindows.shipping;
    setTimeWindow(options[0] || "All day");
  }, [fulfillment, settings]);

  const items = useMemo(() => {
    const out: Array<{ productSlug: string; packType: "piece" | "6pack" | "12pack"; quantity: number }> = [];
    for (const p of products) {
      const q = qty[p.slug] || { piece: 0, "6pack": 0, "12pack": 0 };
      (["piece", "6pack", "12pack"] as const).forEach((pack) => {
        if (q[pack] > 0) out.push({ productSlug: p.slug, packType: pack, quantity: q[pack] });
      });
    }
    return out;
  }, [qty, products]);

  const estimateSubtotal = useMemo(() => {
    let cents = 0;
    for (const i of items) {
      const p = products.find((x) => x.slug === i.productSlug);
      if (!p) continue;
      const unit = i.packType === "piece" ? p.pricePerPiece : i.packType === "6pack" ? p.price6Pack : p.price12Pack;
      cents += unit * i.quantity;
    }
    return cents;
  }, [items, products]);

  const needsAddress = fulfillment === "DELIVERY" || fulfillment === "SHIPPING";

  async function submit() {
    setError(null);
    if (items.length === 0) return setError("Please select at least one item.");
    if (!consent) return setError("Please confirm your details are correct.");

    setLoading(true);
    try {
      const payload = {
        fullName,
        phone,
        email,
        fulfillment,
        requestedDateLocalYmd: dateYmd,
        timeWindow,
        addressLine1: needsAddress ? addressLine1 : undefined,
        addressLine2: needsAddress ? addressLine2 : undefined,
        city: needsAddress ? city : undefined,
        state: needsAddress ? state : undefined,
        zip: needsAddress ? zip : undefined,
        instructions: needsAddress ? instructions : undefined,
        paymentMethod,
        notes,
        consent: true,
        items,
        // honeypot
        website: ""
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to place order.");

      window.location.href = `/order/confirmation/${data.orderId}`;
    } catch (e: any) {
      setError(e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const timeOptions =
    settings
      ? fulfillment === "PICKUP"
        ? settings.timeWindows.pickup
        : fulfillment === "DELIVERY"
        ? settings.timeWindows.delivery
        : settings.timeWindows.shipping
      : [];

  return (
    <section id="order" className="pt-12 scroll-mt-24">
      <h2 className="text-2xl font-extrabold tracking-tight">Order</h2>
      <p className="mt-2 text-neutral-700">
        Fast checkout. Cutoff enforced: <span className="font-semibold">Order by 6 PM (night before)</span>.
      </p>

      <Card className="mt-6 p-5">
        {/* Customer */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-xs font-semibold text-neutral-600">Full Name *</div>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-600">Phone *</div>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(xxx) xxx-xxxx" />
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-600">Email *</div>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
        </div>

        {/* Items */}
        <div className="mt-6">
          <div className="text-sm font-extrabold">Select quantities</div>
          <p className="mt-1 text-sm text-neutral-600">Choose pack sizes for each sweet.</p>

          <div className="mt-4 grid gap-4">
            {products.map((p) => {
              const q = qty[p.slug] || { piece: 0, "6pack": 0, "12pack": 0 };
              const set = (pack: "piece" | "6pack" | "12pack", v: number) =>
                setQty((prev) => ({ ...prev, [p.slug]: { ...(prev[p.slug] || q), [pack]: Math.max(0, Math.min(999, v)) } }));
              return (
                <div key={p.slug} className="rounded-2xl border border-black/10 p-4 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-extrabold">{p.name}</div>
                    <div className="text-sm font-semibold text-maroon-800">{centsToUsd(p.price6Pack)} <span className="text-xs text-neutral-500 font-normal">/ 6-pack</span></div>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <QtyBox label={`Per piece (${centsToUsd(p.pricePerPiece)})`} value={q.piece} onChange={(v) => set("piece", v)} />
                    <QtyBox label={`6-pack (${centsToUsd(p.price6Pack)})`} value={q["6pack"]} onChange={(v) => set("6pack", v)} />
                    <QtyBox label={`12-pack (${centsToUsd(p.price12Pack)})`} value={q["12pack"]} onChange={(v) => set("12pack", v)} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-2xl border border-black/10 bg-cream p-4">
            <div className="text-sm font-semibold text-neutral-700">Estimated subtotal</div>
            <div className="text-lg font-extrabold text-maroon-900">{centsToUsd(estimateSubtotal)}</div>
          </div>
        </div>

        {/* Fulfillment */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div>
            <div className="text-xs font-semibold text-neutral-600">Fulfillment *</div>
            <Select value={fulfillment} onChange={(e) => setFulfillment(e.target.value as any)}>
              <option value="PICKUP">Pickup</option>
              <option value="DELIVERY">Local Delivery</option>
              <option value="SHIPPING">Shipping</option>
            </Select>
          </div>

          <div>
            <div className="text-xs font-semibold text-neutral-600">Date *</div>
            <Input type="date" value={dateYmd} onChange={(e) => setDateYmd(e.target.value)} />
            <div className="mt-1 text-xs text-neutral-500">Invalid dates will be auto-corrected after submit.</div>
          </div>

          <div>
            <div className="text-xs font-semibold text-neutral-600">Time window *</div>
            <Select value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)}>
              {timeOptions.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </div>
        </div>

        {fulfillment === "SHIPPING" && settings?.shippingDisclaimer && (
          <div className="mt-4 rounded-2xl border border-saffron-100 bg-saffron-50 p-4 text-sm text-neutral-700">
            <span className="font-semibold">Shipping note:</span> {settings.shippingDisclaimer}
          </div>
        )}

        {/* Address */}
        {needsAddress && (
          <div className="mt-6">
            <div className="text-sm font-extrabold">Address</div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold text-neutral-600">Street *</div>
                <Input value={addressLine1} onChange={(e) => setAddressLine1(e.target.value)} placeholder="Street address" />
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold text-neutral-600">Apt / Suite</div>
                <Input value={addressLine2} onChange={(e) => setAddressLine2(e.target.value)} placeholder="Optional" />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-600">City *</div>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-600">State *</div>
                <Input value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <div>
                <div className="text-xs font-semibold text-neutral-600">ZIP *</div>
                <Input value={zip} onChange={(e) => setZip(e.target.value)} />
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold text-neutral-600">Delivery/Shipping instructions</div>
                <Input value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="Gate code, drop-off note, etc." />
              </div>
            </div>
          </div>
        )}

        {/* Payment + Notes */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs font-semibold text-neutral-600">Preferred payment *</div>
            <Select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
              <option value="CASH">Cash</option>
              <option value="ZELLE">Zelle</option>
              <option value="VENMO">Venmo</option>
            </Select>
          </div>
          <div>
            <div className="text-xs font-semibold text-neutral-600">Special instructions / allergy notes</div>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Allergy notes, less syrup, etc." />
          </div>
        </div>

        <div className="mt-6">
          <Checkbox checked={consent} onChange={setConsent} label={<span>I confirm my details are correct.</span>} />
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-maroon-200 bg-maroon-50 p-3 text-sm text-maroon-900">
            {error}
          </div>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-neutral-500">
            Service area: <span className="font-semibold text-neutral-700">{settings?.serviceArea || "Loading..."}</span>
          </div>
          <Button onClick={submit} disabled={loading}>
            {loading ? "Placing order..." : "Place Order"}
          </Button>
        </div>
      </Card>
    </section>
  );
}

function QtyBox({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="rounded-xl border border-black/10 bg-cream p-3">
      <div className="text-[11px] font-semibold text-neutral-600">{label}</div>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          className="h-9 w-9 rounded-xl border border-black/10 bg-white text-lg font-bold"
          onClick={() => onChange(value - 1)}
          aria-label="Decrease"
        >
          −
        </button>
        <input
          className="h-9 w-full rounded-xl border border-black/10 bg-white text-center text-sm font-semibold"
          value={value}
          onChange={(e) => onChange(Number(e.target.value || 0))}
          inputMode="numeric"
        />
        <button
          type="button"
          className="h-9 w-9 rounded-xl border border-black/10 bg-white text-lg font-bold"
          onClick={() => onChange(value + 1)}
          aria-label="Increase"
        >
          +
        </button>
      </div>
    </div>
  );
}