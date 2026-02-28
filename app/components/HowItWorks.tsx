import { Card } from "@/app/components/ui/Card";

export function HowItWorks() {
  return (
    <section className="pt-12">
      <h2 className="text-2xl font-extrabold tracking-tight">How it works</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <div className="text-xs font-semibold text-neutral-500">Step 1</div>
          <div className="mt-1 text-lg font-extrabold">Choose your sweets</div>
          <p className="mt-2 text-sm text-neutral-700">Select Gulab Jamun or Kaal Jamun—piece, 6-pack, or 12-pack.</p>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-neutral-500">Step 2</div>
          <div className="mt-1 text-lg font-extrabold">Pick fulfillment</div>
          <p className="mt-2 text-sm text-neutral-700">Pickup, local delivery, or shipping—with clear time windows.</p>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-neutral-500">Step 3</div>
          <div className="mt-1 text-lg font-extrabold">Confirm & pay</div>
          <p className="mt-2 text-sm text-neutral-700">You’ll get an Order ID + payment instructions (Cash/Zelle/Venmo).</p>
        </Card>
      </div>
    </section>
  );
}