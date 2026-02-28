import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json().catch(() => null);
  const status = body?.status;

  if (!status) return NextResponse.json({ message: "Missing status" }, { status: 400 });

  await prisma.order.update({
    where: { id: params.id },
    data: { status }
  });

  return NextResponse.json({ ok: true });
}