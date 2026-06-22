import { z } from "zod";

export const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().min(3).max(80),
  body: z.string().trim().min(10).max(2000),
});

export const couponSchema = z.object({
  code: z.string().trim().toUpperCase().min(3).max(32),
  subtotal: z.coerce.number().min(0),
});
