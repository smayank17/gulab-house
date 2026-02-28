export function PolicyBanner() {
  return (
    <section className="pt-12">
      <div className="rounded-2xl border border-maroon-200 bg-gradient-to-r from-maroon-50 to-saffron-50 p-5">
        <div className="text-xs font-semibold text-neutral-600">Cutoff policy</div>
        <div className="mt-1 text-lg font-extrabold text-maroon-900">Order by 6:00 PM (night before)</div>
        <p className="mt-2 text-sm text-neutral-700">
          To keep everything fresh and consistent, we prepare in small batches. The website will automatically allow only
          eligible dates. If you pick an invalid date, we’ll move you to the next available date.
        </p>
      </div>
    </section>
  );
}