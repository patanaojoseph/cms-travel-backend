import { z } from "zod";

const objectIdSchema = z
  .string({ required_error: "ID is required" })
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

const imageSchema = z.object({
  public_id: z.string({ required_error: "Public ID is required" }),
  url: z.string({ required_error: "URL is required" }).url("Invalid image URL"),
});

const CATEGORIES = [
  "Beach",
  "Mountain",
  "Cultural",
  "Historical",
  "City",
  "Adventure",
];

const BUDGET_LEVELS = ["Budget", "Mid-Range", "Luxury"];

// Sub-schemas defined separately so they can be reused/partialized easily
const locationSchema = z.object({
  region: z
    .string({ required_error: "Region is required" })
    .trim()
    .min(1, "Region is required"),
  country: z
    .string({ required_error: "Country is required" })
    .trim()
    .min(1, "Country is required"),
  coordinates: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
    })
    .optional(),
});

export const createDestinationSchema = z.object({
  title: z
    .string({ required_error: "Please provide destination name" })
    .trim()
    .min(1, "Please provide destination name")
    .max(100, "Title cannot exceed 100 characters"),

  slug: z.string().lowercase().optional(),

  location: locationSchema,

  category: z.enum(CATEGORIES, {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),

  shortDescription: z
    .string({ required_error: "Please provide a short summary for cards" })
    .trim()
    .min(1, "Please provide a short summary for cards")
    .max(300, "Summary cannot exceed 300 characters"),

  fullContent: z
    .string({ required_error: "Please provide full destination details" })
    .trim()
    .min(1, "Please provide full destination details"),

  featuredImage: imageSchema,

  gallery: z.array(imageSchema).default([]),

  bestTimeToVisit: z.string().trim().optional(),

  budgetLevel: z.enum(BUDGET_LEVELS).default("Mid-Range"),

  isFeatured: z.boolean().default(false),

  createdBy: objectIdSchema.optional(),
});

/**
 * Update schema: top-level partial + explicitly partialized nested objects
 */
export const updateDestinationSchema = createDestinationSchema
  .partial()
  .extend({
    location: locationSchema.partial().optional(),
    featuredImage: imageSchema.partial().optional(),
  });
