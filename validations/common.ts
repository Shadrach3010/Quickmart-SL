import { z } from "zod";

export const entityIdSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

export const phoneSchema = z
  .string()
  .trim()
  .transform((value) => {
    const normalized = value.replace(/[\s()-]/g, "");
    return normalized.startsWith("0") ? normalized.slice(1) : normalized;
  })
  .refine(
    (value) => /^(?:\+?232)?(?:2[125]|3[034]|7[6789]|8[08]|9[09])\d{6}$/.test(value),
    { message: "Enter a valid Sierra Leone phone number, for example +232 76 123 456." },
  );
