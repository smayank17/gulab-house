export function centsToUsd(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function safePhone(p: string): string {
  return p.replace(/[^\d+]/g, "").slice(0, 20);
}