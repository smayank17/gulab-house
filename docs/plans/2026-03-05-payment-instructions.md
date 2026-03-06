# Payment Instructions Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Show Zelle and Venmo payment instructions (using the business phone number) on the order confirmation page.

**Architecture:** Single file change — update `app/order/confirmation/[orderId]/page.tsx` to replace the DB-based `payment_handles` lookup with a phone number formatter that reads `NEXT_PUBLIC_WHATSAPP_NUMBER` directly from env. CASH orders show "Pay at pickup/delivery". Zelle/Venmo orders show both payment options with the formatted phone number.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS.

---

### Task 1: Update the confirmation page payment section

**Files:**
- Modify: `app/order/confirmation/[orderId]/page.tsx`

**Context:**

The current confirmation page (lines 27-28) fetches `payment_handles` from the DB:
```ts
const handlesSetting = await prisma.setting.findUnique({ where: { key: "payment_handles" } });
const handles = handlesSetting ? JSON.parse(handlesSetting.valueJson) : { zelleHandle: "", venmoHandle: "" };
```

And the payment section (lines 97-100) shows:
```tsx
<div className="mt-5 rounded-2xl border border-saffron-100 bg-saffron-50 p-4 text-sm text-neutral-700">
  <div className="font-extrabold">Payment</div>
  <div className="mt-1">{paymentLine}</div>
</div>
```

Where `paymentLine` (lines 40-45) is:
```ts
const paymentLine =
  order.paymentMethod === "ZELLE"
    ? `Zelle: ${handles.zelleHandle}`
    : order.paymentMethod === "VENMO"
    ? `Venmo: ${handles.venmoHandle}`
    : `Cash (pay at pickup/delivery)`;
```

**What to do:**

Replace the DB lookup + paymentLine + payment section with the new design:

1. Remove the DB lookup (lines 27-28 — the `handlesSetting` and `handles` variables)
2. Remove the `paymentLine` variable (lines 40-45)
3. Add a `formatPhone` helper above the `return` statement
4. Replace the payment `<div>` block with the new UI

**Step 1: Read the current file**

Read `/Users/mayanksaini/gulab-house/app/order/confirmation/[orderId]/page.tsx` in full to understand exact line numbers before editing.

**Step 2: Apply the changes**

The complete updated file should look like this (showing the key changed sections):

**Remove** the DB lookup block (was lines 27-28):
```ts
// DELETE THESE TWO LINES:
const handlesSetting = await prisma.setting.findUnique({ where: { key: "payment_handles" } });
const handles = handlesSetting ? JSON.parse(handlesSetting.valueJson) : { zelleHandle: "", venmoHandle: "" };
```

**Remove** the paymentLine variable (was lines 40-45):
```ts
// DELETE THESE LINES:
const paymentLine =
  order.paymentMethod === "ZELLE"
    ? `Zelle: ${handles.zelleHandle}`
    : order.paymentMethod === "VENMO"
    ? `Venmo: ${handles.venmoHandle}`
    : `Cash (pay at pickup/delivery)`;
```

**Update** the WhatsApp message payment line (was line 56) to still include payment info:
```ts
// REPLACE:
`Payment: ${paymentLine}`;
// WITH:
`Payment: ${order.paymentMethod}`;
```

**Add** the `formatPhone` helper just before the `return` statement:
```ts
function formatPhone(raw = ""): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return raw;
}

const phone = formatPhone(process.env.NEXT_PUBLIC_WHATSAPP_NUMBER);
const isCash = order.paymentMethod === "CASH";
```

**Replace** the payment `<div>` block (was lines 97-100) with:
```tsx
<div className="mt-5 rounded-2xl border border-saffron-100 bg-saffron-50 p-4 text-sm text-neutral-700">
  <div className="font-extrabold">
    How to pay — {centsToUsd(order.subtotalCents)} due
  </div>
  {isCash ? (
    <div className="mt-1">Pay at pickup/delivery.</div>
  ) : (
    <div className="mt-2 grid gap-1">
      <div><span className="font-semibold">Zelle:</span> {phone}</div>
      <div><span className="font-semibold">Venmo:</span> {phone}</div>
      <div className="mt-1 text-xs text-neutral-500">
        Include order number <span className="font-semibold">{order.orderNumber}</span> in the memo.
      </div>
    </div>
  )}
</div>
```

**Step 3: Verify no TypeScript errors**

Run:
```bash
cd /Users/mayanksaini/gulab-house && npx tsc --noEmit
```
Expected: no errors (or only pre-existing errors unrelated to this file).

**Step 4: Commit**

```bash
git add app/order/confirmation/\[orderId\]/page.tsx
git commit -m "feat: show Zelle/Venmo payment instructions on confirmation page"
```
