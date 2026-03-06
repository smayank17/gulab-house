import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";

export async function GET(req: NextRequest) {
  const guard = adminGuard(req);
  if (guard) return guard;

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      orderNumber: true,
      fullName: true,
      phone: true,
      email: true,
      fulfillment: true,
      requestedDate: true,
      timeWindow: true,
      subtotalCents: true,
      status: true,
      createdAt: true
    }
  });

  return NextResponse.json({ orders });
}