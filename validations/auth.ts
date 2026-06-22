import { z } from "zod";
import { APP_ROLES } from "@/lib/constants/roles";
import { phoneSchema } from "@/validations/common";

export const appRoleSchema = z.enum(APP_ROLES);

const passwordSchema = z
  .string()
  .min(8, "Use at least 8 characters.")
  .regex(/[A-Za-z]/, "Include at least one letter.")
  .regex(/[0-9]/, "Include at least one number.");

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

export const signUpSchema = z
  .object({
    firstName: z.string().trim().min(2, "Enter your first name.").max(50),
    lastName: z.string().trim().min(2, "Enter your last name.").max(50),
    email: z.string().trim().toLowerCase().email("Enter a valid email address."),
    password: passwordSchema,
    confirmPassword: z.string(),
    referralCode: z.string().trim().toUpperCase().regex(/^[A-Z0-9]{6,16}$/).optional().or(z.literal("")),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const profileSchema = z.object({
  firstName: z.string().trim().min(2).max(50),
  lastName: z.string().trim().min(2).max(50),
  phone: phoneSchema,
});
