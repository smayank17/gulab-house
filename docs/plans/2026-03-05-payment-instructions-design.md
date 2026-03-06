# Payment Instructions on Confirmation Page — Design

**Date:** 2026-03-05

## Summary

Update the order confirmation page to show clear Zelle and Venmo payment instructions using the business phone number from `NEXT_PUBLIC_WHATSAPP_NUMBER`. Replaces the current DB-based `payment_handles` lookup with a direct env var read.

## What Changes

Only `app/order/confirmation/[orderId]/page.tsx` is modified. No new files, no DB schema changes, no API changes.

## Payment Section

Replace the existing payment box (which reads `zelleHandle`/`venmoHandle` from the `payment_handles` DB setting) with a static "How to pay" section that displays:

- The subtotal amount due
- Zelle: [formatted phone number]
- Venmo: [formatted phone number]
- A reminder to include the order number in the memo

If the customer chose CASH, show "Pay at pickup/delivery" instead of Zelle/Venmo instructions.

## Phone Number Formatting

`NEXT_PUBLIC_WHATSAPP_NUMBER` is stored as raw digits (e.g. `14255551234`). Format it inline for display as `+1 (425) 555-1234`.

Formatter logic:
```ts
function formatPhone(raw: string = ""): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw;
}
```

## What Stays the Same

- `order.paymentMethod` (ZELLE, VENMO, CASH) is still recorded and included in the WhatsApp message
- Order form payment method selector is unchanged
- No changes to API routes, Prisma schema, or admin settings
