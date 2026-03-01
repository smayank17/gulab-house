import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminGuard } from "@/lib/adminGuard";

const ALLOWED_STATUSES = ["NEW", "CONFIRMED", "IN_PROGRESS", "READY", "DELIVERED", "SHIPPED"] as const;

type Params = { id: string };
type Context = { params: Promise<Params> };

export async function PATCH(req: NextRequest, context: Context): Promise<Response> {
  const guard = adminGuard(req);
  if (guard) return guard;

  const { id } = await context.params;

  const body = await req.json().catch(() => null);
  const status = body?.status as string | undefined;

  if (!status || !ALLOWED_STATUSES.includes(status as any)) {
    return NextResponse.json({ message: "Invalid status" }, { status: 400 });
  }

  await prisma.order.update({
    where: { id },
    data: { status }
  });

  return NextResponse.json({ ok: true });
}