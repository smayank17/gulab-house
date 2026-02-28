import { addDays, set } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";
export const BUSINESS_TZ = process.env.BUSINESS_TZ || "America/Los_Angeles";
export const CUTOFF_HOUR = 18; // 6 PM

export function cutoffUtcForFulfillmentDate(fulfillmentDateLocalYmd: string): Date {
  // cutoff is 6 PM the day BEFORE fulfillment date in business timezone

  const fulfillmentMidnightLocal = new Date(`${fulfillmentDateLocalYmd}T00:00:00`);

  const cutoffLocalSameDay = set(fulfillmentMidnightLocal, {
    hours: CUTOFF_HOUR,
    minutes: 0,
    seconds: 0,
    milliseconds: 0
  });

  const dayBeforeLocal = addDays(cutoffLocalSameDay, -1);

  // Convert "business local time" -> UTC Date
  return fromZonedTime(dayBeforeLocal, BUSINESS_TZ);
}

export function isFulfillmentDateAllowed(fulfillmentDateLocalYmd: string, nowUtc = new Date()): boolean {
  const cutoffUtc = cutoffUtcForFulfillmentDate(fulfillmentDateLocalYmd);
  return nowUtc <= cutoffUtc;
}

export function nextAvailableFulfillmentDateLocalYmd(nowUtc = new Date()): string {
  // Find earliest date D such that now <= cutoff(D)
  // Start from tomorrow (MVP assumption)
  let i = 1;
  while (i < 60) {
    const dLocal = formatInTimeZone(addDays(nowUtc, i), BUSINESS_TZ, "yyyy-MM-dd");
    if (isFulfillmentDateAllowed(dLocal, nowUtc)) return dLocal;
    i++;
  }
  return formatInTimeZone(addDays(nowUtc, 2), BUSINESS_TZ, "yyyy-MM-dd");
}

export function prettyBusinessDate(ymd: string): string {
  const dt = new Date(`${ymd}T00:00:00`);
  return formatInTimeZone(dt, BUSINESS_TZ, "EEE, MMM d");
}