import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Please enter your email address" })
    .trim()
    .min(1, "Please enter your email address")
    .email("Please enter a valid email address")
    .toLowerCase(),

  password: z
    .string({ required_error: "Please enter your password" })
    .min(1, "Please enter your password"),
});

export const updatePasswordSchema = z
  .object({
    oldPassword: z
      .string({ required_error: "Please enter your current password" })
      .min(1, "Please enter your current password"),

    newPassword: z
      .string({ required_error: "Please enter a new password" })
      .min(8, "New password must be at least 8 characters long"),

    confirmPassword: z
      .string({ required_error: "Please confirm your new password" })
      .min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export const verifyPasswordSchema = z.object({
  password: z
    .string({ required_error: "Please enter your password to verify" })
    .min(1, "Please enter your password to verify"),
});
