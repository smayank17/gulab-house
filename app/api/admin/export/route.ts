import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function csvEscape(v: any) {
  const s = String(v ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { items: { include: { product: true } } }
  });

  const header = [
    "orderNumber",
    "status",
    "createdAt",
    "fullName",
    "phone",
    "email",
    "fulfillment",
    "requestedDate",
    "timeWindow",
    "subtotal",
    "items",
    "address",
    "notes"
  ];

  const rows = orders.map((o) => {
    const items = o.items.map((i) => `${i.product.name}:${i.packType}x${i.quantity}`).join(" | ");
    const address = o.addressLine1
      ? `${o.addressLine1}${o.addressLine2 ? ", " + o.addressLine2 : ""}, ${o.city}, ${o.state} ${o.zip}`
      : "";
    return [
      o.orderNumber,
      o.status,
      o.createdAt.toISOString(),
      o.fullName,
      o.phone,
      o.email,
      o.fulfillment,
      o.requestedDate.toISOString().slice(0, 10),
      o.timeWindow,
      (o.subtotalCents / 100).toFixed(2),
      items,
      address,
      o.notes ?? ""
    ].map(csvEscape);
  });

  const csv = [header.join(","), ...rows.map((r) => r.join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="gulab-house-orders.csv"`
    }
  });
}