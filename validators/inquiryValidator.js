import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

/**
 * Zod schema for public inquiry creation
 */
export const createInquirySchema = z.object({
  name: z
    .string({ required_error: "Please provide your name" })
    .trim()
    .min(1, "Please provide your name"),

  email: z
    .string({ required_error: "Please provide your email" })
    .trim()
    .email("Please provide a valid email address")
    .toLowerCase(),

  phone: z
    .string({ required_error: "Please provide your phone number" })
    .trim()
    .min(1, "Please provide your phone number"),

  message: z
    .string({ required_error: "Please provide your message" })
    .trim()
    .min(1, "Please provide your message"),

  destinationId: objectIdSchema.optional().nullable(),
});

/**
 * Zod schema for updating inquiry status by Admin
 */
export const updateInquiryStatusSchema = z.object({
  status: z.enum(["pending", "resolved"], {
    errorMap: () => ({
      message: "Invalid status value. Allowed: 'pending' or 'resolved'",
    }),
  }),
});
