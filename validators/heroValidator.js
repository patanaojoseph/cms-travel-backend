import { z } from "zod";

const imageSchema = z.object({
  public_id: z.string({ required_error: "Public ID is required" }),
  url: z.string({ required_error: "URL is required" }).url("Invalid image URL"),
});

export const createHeroSchema = z.object({
  title: z
    .string({ required_error: "Please provide a slide title" })
    .trim()
    .min(1, "Please provide a slide title")
    .max(100, "Title cannot exceed 100 characters"),

  subtitle: z
    .string()
    .trim()
    .max(200, "Subtitle cannot exceed 200 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  image: imageSchema,

  ctaLink: z.string().trim().optional(),

  ctaText: z.string().trim().default("Explore Spot"),

  order: z.number().int().default(0),

  isActive: z.boolean().default(true),
});

export const updateHeroSchema = createHeroSchema.partial().extend({
  image: imageSchema.partial().optional(),
});
