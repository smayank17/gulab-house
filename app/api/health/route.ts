import { NextResponse } from "next/server";
import { nextAvailableFulfillmentDateLocalYmd } from "@/lib/cutoff";

export async function GET() {
  return NextResponse.json({
    ok: true,
    nextAvailableDateLocalYmd: nextAvailableFulfillmentDateLocalYmd(new Date())
  });
}