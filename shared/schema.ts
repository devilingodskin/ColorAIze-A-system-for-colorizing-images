import { z } from "zod";

// Image status enum
export type ImageStatus = "pending" | "processing" | "completed" | "failed";

// Image schema for validation
export const imageSchema = z.object({
  id: z.number(),
  originalUrl: z.string(),
  colorizedUrl: z.string().nullable().optional(),
  status: z.enum(["pending", "processing", "completed", "failed"]),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.string(), // ISO date string
});

// TypeScript type derived from schema
export type Image = z.infer<typeof imageSchema>;

// Schema for creating a new image (without auto-generated fields)
export const insertImageSchema = z.object({
  originalUrl: z.string(),
});
