import { Button } from "@/app/components/ui/Button";

export function Contact() {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || ""; // e.g. 1425xxxxxxx
  const waLink = whatsapp ? `https://wa.me/${whatsapp}` : "https://wa.me/";

  return (
    <section className="pt-12 pb-10">
      <h2 className="text-2xl font-extrabold tracking-tight">Contact</h2>
      <p className="mt-2 text-neutral-700">
        Questions, custom requests, or gifting? Message us anytime.
      </p>

      <div className="mt-6 rounded-2xl border border-black/10 bg-white p-5">
        <div className="text-sm font-semibold text-neutral-700">Hygiene & homemade assurance</div>
        <p className="mt-2 text-sm text-neutral-700">
          We prepare in small batches, focus on clean handling, and package neatly for freshness. Ingredients are selected for a premium,
          balanced sweetness—ideal for guests, gifting, and festivals.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          <a href={waLink} target="_blank" rel="noreferrer">
            <Button>WhatsApp Quick Order</Button>
          </a>
          <a href="#order">
            <Button variant="secondary">Place an order</Button>
          </a>
        </div>
      </div>

      <footer className="mt-8 text-xs text-neutral-500">
        © {new Date().getFullYear()} Gulab House. Premium homemade Indian sweets.
      </footer>
    </section>
  );
}