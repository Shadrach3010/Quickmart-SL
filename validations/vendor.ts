import { z } from "zod";
import { ORDER_STATUSES } from "@/lib/constants/commerce";

export const vendorProductSchema = z.object({
  name: z.string().trim().min(2).max(160),
  categoryId: z.string().uuid().nullable().optional(),
  sku: z.string().trim().max(80).nullable().optional(),
  description: z.string().trim().max(2000).nullable().optional(),
  unit: z.string().trim().min(1).max(40),
  price: z.coerce.number().min(0),
  compareAtPrice: z.preprocess(
    (value) => (value === "" || Number.isNaN(value) ? null : value),
    z.coerce.number().min(0).nullable(),
  ).optional(),
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

export const inventoryUpdateSchema = z.object({
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});

export const vendorOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const vendorSettingsSchema = z.object({
  name: z.string().trim().min(2).max(160),
  description: z.string().trim().max(2000).nullable(),
  phone: z.string().trim().max(30).nullable(),
  email: z.email().nullable(),
  addressLine: z.string().trim().max(250).nullable(),
  city: z.string().trim().min(2).max(80),
  deliveryFee: z.coerce.number().min(0),
  minimumOrderAmount: z.coerce.number().min(0),
  estimatedDeliveryMinutes: z.preprocess(
    (value) => (value === "" || Number.isNaN(value) ? null : value),
    z.coerce.number().int().positive().nullable(),
  ),
});
