import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { OrderCreateSchema, requireAddressIfNeeded } from "@/lib/validators";
import { checkRateLimit } from "@/lib/rateLimit";
import { isFulfillmentDateAllowed, nextAvailableFulfillmentDateLocalYmd } from "@/lib/cutoff";
import { sendCustomerEmail, sendOwnerEmail } from "@/lib/email";
import { formatInTimeZone } from "date-fns-tz";
import { BUSINESS_TZ } from "@/lib/cutoff";

function randomOrderNumber() {
  const d = new Date();
  const ymd = formatInTimeZone(d, BUSINESS_TZ, "yyyyMMdd");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `GH-${ymd}-${rand}`;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const rl = await checkRateLimit(`order:${ip}`);
  if (!rl.ok) return NextResponse.json({ message: "Too many requests. Please try again shortly." }, { status: 429 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ message: "Invalid JSON." }, { status: 400 });

  // Honeypot spam field
  if (body.website && String(body.website).trim().length > 0) {
    return NextResponse.json({ message: "Spam detected." }, { status: 400 });
  }

  const parsed = OrderCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ message: "Please check your details and try again.", issues: parsed.error.issues }, { status: 400 });
  }

  const input = parsed.data;

  try {
    requireAddressIfNeeded(input);
  } catch (e: any) {
    return NextResponse.json({ message: e.message || "Address required." }, { status: 400 });
  }

  // Cutoff enforcement
  let dateYmd = input.requestedDateLocalYmd;
  const allowed = isFulfillmentDateAllowed(dateYmd, new Date());
  if (!allowed) {
    dateYmd = nextAvailableFulfillmentDateLocalYmd(new Date());
  }

  // Load products for pricing integrity
  const products = await prisma.product.findMany({ where: { isActive: true } });
  const productBySlug = new Map(products.map((p) => [p.slug, p]));

  const itemsRequested = input.items.filter((i) => i.quantity > 0);
  if (itemsRequested.length === 0) {
    return NextResponse.json({ message: "Please select at least one item." }, { status: 400 });
  }

  const orderItems: Array<{
    productId: string;
    packType: string;
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
  }> = [];

  let subtotalCents = 0;

  for (const it of itemsRequested) {
    const p = productBySlug.get(it.productSlug);
    if (!p) return NextResponse.json({ message: "One of the items is unavailable." }, { status: 400 });

    const unit =
      it.packType === "piece" ? p.pricePerPiece : it.packType === "6pack" ? p.price6Pack : p.price12Pack;

    const line = unit * it.quantity;
    subtotalCents += line;

    orderItems.push({
      productId: p.id,
      packType: it.packType,
      quantity: it.quantity,
      unitPriceCents: unit,
      lineTotalCents: line
    });
  }

  const orderNumber = randomOrderNumber();

  // Persist
  const order = await prisma.order.create({
    data: {
      orderNumber,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email,
      fulfillment: input.fulfillment,
      requestedDate: new Date(`${dateYmd}T00:00:00`),
      timeWindow: input.timeWindow,

      addressLine1: input.addressLine1 || null,
      addressLine2: input.addressLine2 || null,
      city: input.city || null,
      state: input.state || null,
      zip: input.zip || null,
      instructions: input.instructions || null,

      paymentMethod: input.paymentMethod,
      notes: input.notes || null,
      subtotalCents,

      items: { create: orderItems }
    },
    include: {
      items: { include: { product: true } }
    }
  });

  // Settings for payment handles
  const handlesSetting = await prisma.setting.findUnique({ where: { key: "payment_handles" } });
  const handles = handlesSetting ? JSON.parse(handlesSetting.valueJson) : { zelleHandle: "", venmoHandle: "" };

  // Emails (best effort)
  const emailOrder = {
    orderNumber: order.orderNumber,
    fullName: order.fullName,
    email: order.email,
    phone: order.phone,
    fulfillment: order.fulfillment,
    requestedDateLocalYmd: dateYmd,
    timeWindow: order.timeWindow,
    paymentMethod: order.paymentMethod,
    subtotalCents: order.subtotalCents,
    items: order.items.map((i) => ({
      name: i.product.name,
      packType: i.packType,
      quantity: i.quantity,
      lineTotalCents: i.lineTotalCents
    })),
    address: order.addressLine1
      ? `${order.addressLine1}${order.addressLine2 ? ", " + order.addressLine2 : ""}, ${order.city}, ${order.state} ${order.zip}`
      : undefined,
    notes: order.notes
  };

  await Promise.allSettled([sendOwnerEmail(emailOrder), sendCustomerEmail(emailOrder, handles)]);

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.orderNumber,
    correctedDate: !allowed ? dateYmd : null
  });
}