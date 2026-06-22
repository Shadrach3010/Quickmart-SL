import { z } from "zod";
import {
  ORDER_STATUSES,
  PAYMENT_METHODS,
} from "@/lib/constants/commerce";
import { entityIdSchema, phoneSchema } from "@/validations/common";

export const cartItemSchema = z.object({
  productId: entityIdSchema,
  quantity: z.number().int().min(1).max(99),
});

export const deliveryAddressSchema = z.object({
  label: z.string().trim().min(2).max(40),
  recipientName: z.string().trim().min(2).max(100),
  phone: phoneSchema,
  addressLine: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(80),
  landmark: z.string().trim().max(150).nullable(),
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1),
  paymentMethod: z.enum(PAYMENT_METHODS),
  deliveryAddress: deliveryAddressSchema,
  coupon: z.string().trim().max(40).optional(),
});

export const orderStatusSchema = z.enum(ORDER_STATUSES);
