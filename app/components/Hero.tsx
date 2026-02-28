import { Button } from "@/app/components/ui/Button";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-black/5 bg-gradient-to-b from-white to-cream">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-saffron-50 px-3 py-1 text-xs font-semibold text-saffron-800 border border-saffron-100">
          <span>Scan to Order • Gulab House</span>
          <span className="text-neutral-400">•</span>
          <span>Order by 6 PM (Night Before)</span>
        </div>

        <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl">
          Premium Homemade Indian Sweets,
          <span className="text-maroon-800"> ready for your celebrations</span>
        </h1>

        <p className="mt-4 max-w-xl text-neutral-700">
          Order in under 60 seconds. Small-batch Gulab Jamun & Kaal Jamun—crafted with care, packaged neatly, and served
          fresh.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href="#order">
            <Button>Order Now</Button>
          </a>
          <a href="#products">
            <Button variant="secondary">View Sweets</Button>
          </a>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/70 p-4 border border-black/5">
            <div className="text-xs font-semibold text-neutral-500">Fast</div>
            <div className="mt-1 font-semibold">Checkout in <span className="text-maroon-800">under 60s</span></div>
          </div>
          <div className="rounded-2xl bg-white/70 p-4 border border-black/5">
            <div className="text-xs font-semibold text-neutral-500">Premium</div>
            <div className="mt-1 font-semibold">Small-batch, clean sweetness</div>
          </div>
          <div className="rounded-2xl bg-white/70 p-4 border border-black/5">
            <div className="text-xs font-semibold text-neutral-500">Flexible</div>
            <div className="mt-1 font-semibold">Pickup • Delivery • Shipping</div>
          </div>
        </div>
      </div>
    </section>
  );
}