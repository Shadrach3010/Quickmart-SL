import { z } from "zod";

export const deliveryStatusUpdateSchema = z.object({
  status: z.enum(["picked_up", "in_transit", "delivered", "failed"]),
});
