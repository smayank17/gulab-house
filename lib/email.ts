import { Resend } from "resend";
import { centsToUsd } from "@/lib/formatting";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

type EmailOrder = {
  orderNumber: string;
  fullName: string;
  email: string;
  phone: string;
  fulfillment: string;
  requestedDateLocalYmd: string;
  timeWindow: string;
  paymentMethod: string;
  subtotalCents: number;
  items: Array<{ name: string; packType: string; quantity: number; lineTotalCents: number }>;
  address?: string;
  notes?: string | null;
};

function lines(o: EmailOrder) {
  const itemLines = o.items
    .filter((i) => i.quantity > 0)
    .map((i) => `• ${i.name} (${i.packType}) × ${i.quantity} — ${centsToUsd(i.lineTotalCents)}`)
    .join("\n");

  return [
    `Order ID: ${o.orderNumber}`,
    `Name: ${o.fullName}`,
    `Phone: ${o.phone}`,
    `Fulfillment: ${o.fulfillment}`,
    `Date: ${o.requestedDateLocalYmd}`,
    `Time window: ${o.timeWindow}`,
    o.address ? `Address: ${o.address}` : null,
    `Payment: ${o.paymentMethod}`,
    ``,
    `Items:`,
    itemLines,
    ``,
    `Subtotal: ${centsToUsd(o.subtotalCents)}`,
    o.notes ? `Notes: ${o.notes}` : null
  ]
    .filter(Boolean)
    .join("\n");
}

export async function sendCustomerEmail(o: EmailOrder, handles: { zelleHandle: string; venmoHandle: string }) {
  if (!resend) return;

  const from = process.env.EMAIL_FROM!;
  const subject = `Gulab House Order Confirmed — ${o.orderNumber}`;

  const paymentLine =
    o.paymentMethod === "ZELLE"
      ? `Zelle: ${handles.zelleHandle}`
      : o.paymentMethod === "VENMO"
      ? `Venmo: ${handles.venmoHandle}`
      : `Cash: Pay at pickup/delivery`;

  const text =
    `Thank you for ordering from Gulab House.\n\n` +
    `${lines(o)}\n\n` +
    `Payment details:\n${paymentLine}\n\n` +
    `Cutoff reminder: Orders must be placed by 6 PM (night before the requested date).\n` +
    `— Gulab House`;

  await resend.emails.send({
    from,
    to: o.email,
    subject,
    text
  });
}

export async function sendOwnerEmail(o: EmailOrder) {
  if (!resend) return;
  const from = process.env.EMAIL_FROM!;
  const to = process.env.OWNER_EMAIL!;
  const subject = `New Gulab House Order — ${o.orderNumber}`;

  await resend.emails.send({
    from,
    to,
    subject,
    text: lines(o)
  });
}