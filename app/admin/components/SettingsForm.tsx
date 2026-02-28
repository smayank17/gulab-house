"use client";

import { useEffect, useState } from "react";
import { Card } from "@/app/components/ui/Card";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";

type Settings = {
  paymentHandles: { zelleHandle: string; venmoHandle: string };
  serviceArea: { text: string };
  timeWindows: { pickup: string[]; delivery: string[]; shipping: string[] };
  shippingDisclaimer: { text: string };
};

export function SettingsForm() {
  const [s, setS] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  async function load() {
    const r = await fetch("/api/admin/settings", { cache: "no-store" });
    const d = await r.json();
    setS({
      paymentHandles: d.paymentHandles || { zelleHandle: "", venmoHandle: "" },
      serviceArea: d.serviceArea || { text: "" },
      timeWindows: d.timeWindows || { pickup: [], delivery: [], shipping: [] },
      shippingDisclaimer: d.shippingDisclaimer || { text: "" }
    });
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(s)
    });
    setSaving(false);
    load();
  }

  if (!s) return <div className="text-sm text-neutral-500">Loading...</div>;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between">
        <div className="text-sm font-extrabold">Edit site settings</div>
        <Button onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</Button>
      </div>

      <div className="mt-5 grid gap-4">
        <div className="rounded-2xl border border-black/10 p-4">
          <div className="font-extrabold">Payment handles</div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <Field label="Zelle handle">
              <Input value={s.paymentHandles.zelleHandle} onChange={(e) => setS({ ...s, paymentHandles: { ...s.paymentHandles, zelleHandle: e.target.value } })} />
            </Field>
            <Field label="Venmo handle">
              <Input value={s.paymentHandles.venmoHandle} onChange={(e) => setS({ ...s, paymentHandles: { ...s.paymentHandles, venmoHandle: e.target.value } })} />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 p-4">
          <div className="font-extrabold">Service area text</div>
          <div className="mt-3">
            <Input value={s.serviceArea.text} onChange={(e) => setS({ ...s, serviceArea: { text: e.target.value } })} />
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 p-4">
          <div className="font-extrabold">Time windows</div>
          <p className="mt-1 text-sm text-neutral-600">Comma-separated (example: 12–2 PM, 4–6 PM)</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <Field label="Pickup">
              <Input
                value={s.timeWindows.pickup.join(", ")}
                onChange={(e) => setS({ ...s, timeWindows: { ...s.timeWindows, pickup: splitCsv(e.target.value) } })}
              />
            </Field>
            <Field label="Delivery">
              <Input
                value={s.timeWindows.delivery.join(", ")}
                onChange={(e) => setS({ ...s, timeWindows: { ...s.timeWindows, delivery: splitCsv(e.target.value) } })}
              />
            </Field>
            <Field label="Shipping">
              <Input
                value={s.timeWindows.shipping.join(", ")}
                onChange={(e) => setS({ ...s, timeWindows: { ...s.timeWindows, shipping: splitCsv(e.target.value) } })}
              />
            </Field>
          </div>
        </div>

        <div className="rounded-2xl border border-black/10 p-4">
          <div className="font-extrabold">Shipping disclaimer</div>
          <div className="mt-3">
            <Input
              value={s.shippingDisclaimer.text}
              onChange={(e) => setS({ ...s, shippingDisclaimer: { text: e.target.value } })}
            />
          </div>
        </div>
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

function splitCsv(v: string) {
  return v.split(",").map((s) => s.trim()).filter(Boolean);
}