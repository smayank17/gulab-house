const faqs = [
  {
    q: "What does “Order by 6 PM (night before)” mean?",
    a: "If you want pickup/delivery/shipping on a certain date, you must place your order before 6:00 PM the day before. The website automatically allows only eligible dates."
  },
  {
    q: "Do you accept card payments?",
    a: "Not at the moment. We accept Cash, Zelle, and Venmo."
  },
  {
    q: "Are the sweets eggless?",
    a: "Yes—our Gulab Jamun and Kaal Jamun are eggless. They contain dairy."
  },
  {
    q: "How does shipping work?",
    a: "We package carefully for transit; however, shipping times depend on the carrier and conditions. Please order early for events and gifts."
  },
  {
    q: "Can you reduce syrup or customize?",
    a: "Add a note in the order form. We’ll confirm what’s possible for your batch."
  }
];

export function FAQ() {
  return (
    <section className="pt-12">
      <h2 className="text-2xl font-extrabold tracking-tight">FAQs</h2>
      <div className="mt-6 grid gap-3">
        {faqs.map((f) => (
          <div key={f.q} className="rounded-2xl border border-black/10 bg-white p-5">
            <div className="font-extrabold">{f.q}</div>
            <div className="mt-2 text-sm text-neutral-700">{f.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}