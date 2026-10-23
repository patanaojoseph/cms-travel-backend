import { z } from "zod";

const mediaSchema = z.object({
  public_id: z.string({ required_error: "Public ID is required" }),
  url: z.string({ required_error: "URL is required" }).url("Invalid media URL"),
});

export const createHeroSchema = z.object({
  title: z
    .string({ required_error: "Please provide a headline title" })
    .trim()
    .min(1, "Please provide a headline title")
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

  mediaType: z
    .enum(["video", "image"], {
      errorMap: () => ({
        message: "Media type must be either 'video' or 'image'",
      }),
    })
    .default("video"),

  media: mediaSchema,

  ctaLink: z.string().trim().optional().default("#plan"),

  ctaText: z.string().trim().optional().default("Explore Destinations"),

  order: z.number().int().default(0),

  isActive: z.boolean().default(true),
});

export const updateHeroSchema = createHeroSchema.partial().extend({
  media: mediaSchema.partial().optional(),
});
