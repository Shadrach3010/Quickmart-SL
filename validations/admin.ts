import { z } from "zod";
import { APP_ROLES } from "@/lib/constants/roles";

export const adminUserUpdateSchema = z.object({
  role: z.enum(APP_ROLES).optional(),
  isActive: z.boolean().optional(),
});

export const adminSupermarketUpdateSchema = z.object({
  status: z.enum(["pending", "active", "suspended", "closed"]).optional(),
  ownerProfileId: z.string().uuid().nullable().optional(),
}).refine(
  (value) => value.status !== undefined || value.ownerProfileId !== undefined,
  "Provide a supermarket update.",
);

export const adminProductBulkSchema = z.object({
  ids: z.array(z.string().min(1)).min(1).max(100),
  isActive: z.boolean(),
});

export const adminDeliveryAssignmentSchema = z.object({
  agentId: z.string().min(1),
});

export const platformSettingsSchema = z.object({
  commissionRate: z.coerce.number().min(0).max(100),
  serviceFee: z.coerce.number().min(0),
  minimumOrderAmount: z.coerce.number().min(0),
  supportEmail: z.string().email(),
  supportPhone: z.string().min(7).max(24),
  maintenanceMode: z.boolean(),
});
