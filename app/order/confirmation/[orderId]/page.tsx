import { prisma } from "@/lib/prisma";
import { centsToUsd } from "@/lib/formatting";
import { makeWhatsAppLink } from "@/lib/whatsapp";
import { prettyBusinessDate } from "@/lib/cutoff";
import { Card } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button";
import { notFound } from "next/navigation";

export default async function ConfirmationPage({
  params
}: {
  params: Promise<{ orderId: string }> | { orderId: string };
}) {
  // Next 16/Turbopack may pass params as a Promise
  const resolved = typeof (params as any)?.then === "function" ? await (params as Promise<{ orderId: string }>) : (params as { orderId: string });
  const orderId = resolved?.orderId;

  if (!orderId) notFound();

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } }
  });

  if (!order) notFound();

  const dateYmd = order.requestedDate.toISOString().slice(0, 10);
  const address =
    order.addressLine1
      ? `${order.addressLine1}${order.addressLine2 ? ", " + order.addressLine2 : ""}, ${order.city}, ${order.state} ${order.zip}`
      : null;

  const itemLines = order.items
    .map((i) => `${i.product.name} (${i.packType}) × ${i.quantity}`)
    .join("\n");

  const waMsg =
    `Gulab House Order ${order.orderNumber}\n` +
    `Name: ${order.fullName}\n` +
    `Fulfillment: ${order.fulfillment}\n` +
    `Date: ${prettyBusinessDate(dateYmd)}\n` +
    `Time: ${order.timeWindow}\n` +
    (address ? `Address: ${address}\n` : "") +
    `Items:\n${itemLines}\n` +
    `Subtotal: ${centsToUsd(order.subtotalCents)}\n` +
    `Payment: ${order.paymentMethod}`;

  const waLink = makeWhatsAppLink(waMsg, process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);

  function formatPhone(raw = ""): string {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 11 && digits.startsWith("1")) {
      return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return raw;
  }

  const phone = formatPhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
  const isCash = order.paymentMethod === "CASH";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="inline-flex items-center gap-2 rounded-full bg-saffron-50 px-3 py-1 text-xs font-semibold text-saffron-800 border border-saffron-100">
        Confirmed • Gulab House
      </div>

      <h1 className="mt-4 text-3xl font-extrabold">Order received</h1>
      <p className="mt-2 text-neutral-700">We’ve emailed your confirmation. Your Order ID is below.</p>

      <Card className="mt-6 p-5">
        <div className="text-xs font-semibold text-neutral-500">Order ID</div>
        <div className="mt-1 text-xl font-extrabold text-maroon-900">{order.orderNumber}</div>

        <div className="mt-5 grid gap-2 text-sm text-neutral-700">
          <div><span className="font-semibold">Name:</span> {order.fullName}</div>
          <div><span className="font-semibold">Fulfillment:</span> {order.fulfillment}</div>
          <div><span className="font-semibold">Date:</span> {prettyBusinessDate(dateYmd)}</div>
          <div><span className="font-semibold">Time window:</span> {order.timeWindow}</div>
          {address && <div><span className="font-semibold">Address:</span> {address}</div>}
        </div>

        <div className="mt-5 border-t border-black/10 pt-4">
          <div className="text-sm font-extrabold">Order summary</div>
          <div className="mt-3 grid gap-2 text-sm">
            {order.items.map((i) => (
              <div key={i.id} className="flex items-center justify-between">
                <div className="text-neutral-700">{i.product.name} <span className="text-neutral-500">({i.packType})</span> × {i.quantity}</div>
                <div className="font-semibold">{centsToUsd(i.lineTotalCents)}</div>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-black/10">
              <div className="font-extrabold">Subtotal</div>
              <div className="text-lg font-extrabold text-maroon-900">{centsToUsd(order.subtotalCents)}</div>
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-saffron-100 bg-saffron-50 p-4 text-sm text-neutral-700">
          <div className="font-extrabold">
            How to pay — {centsToUsd(order.subtotalCents)} due
          </div>
          {isCash ? (
            <div className="mt-1">Pay at pickup/delivery.</div>
          ) : (
            <div className="mt-2 grid gap-1">
              <div><span className="font-semibold">Zelle:</span> {phone}</div>
              <div><span className="font-semibold">Venmo:</span> {phone}</div>
              <div className="mt-1 text-xs text-neutral-500">
                Include order number <span className="font-semibold">{order.orderNumber}</span> in the memo.
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <a href={waLink} target="_blank" rel="noreferrer">
            <Button>WhatsApp this order</Button>
          </a>
          <a href="/" >
            <Button variant="secondary">Back to home</Button>
          </a>
        </div>
      </Card>
    </main>
  );
}