import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const all = await prisma.setting.findMany();
  const map: Record<string, any> = {};
  for (const s of all) map[s.key] = JSON.parse(s.valueJson);

  return NextResponse.json({
    serviceArea: map["service_area"],
    timeWindows: map["time_windows"],
    shippingDisclaimer: map["shipping_disclaimer"],
    paymentHandles: map["payment_handles"]
  });
}