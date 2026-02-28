import { z } from "zod";

export const PackType = z.enum(["piece", "6pack", "12pack"]);

export const OrderItemSchema = z.object({
  productSlug: z.string().min(1),
  packType: PackType,
  quantity: z.number().int().min(0).max(999)
});

export const OrderCreateSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(7),
  email: z.string().email(),

  fulfillment: z.enum(["PICKUP", "DELIVERY", "SHIPPING"]),
  requestedDateLocalYmd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  timeWindow: z.string().min(1),

  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  instructions: z.string().optional(),

  paymentMethod: z.enum(["CASH", "ZELLE", "VENMO"]),
  notes: z.string().optional(),

  consent: z.literal(true),

  items: z.array(OrderItemSchema).min(1)
});

export function requireAddressIfNeeded(input: z.infer<typeof OrderCreateSchema>) {
  const needsAddress = input.fulfillment === "DELIVERY" || input.fulfillment === "SHIPPING";
  if (!needsAddress) return;

  const required = ["addressLine1", "city", "state", "zip"] as const;
  for (const key of required) {
    if (!input[key] || input[key]!.trim().length < 2) {
      throw new Error("Address is required for delivery/shipping.");
    }
  }
}