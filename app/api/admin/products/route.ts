import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
    select: {
      slug: true,
      name: true,
      shortDesc: true,
      longDesc: true,
      imageUrl: true,
      isEggless: true,
      containsDairy: true,
      containsNuts: true,
      pricePerPiece: true,
      price6Pack: true,
      price12Pack: true
    }
  });

  return NextResponse.json({ products });
}