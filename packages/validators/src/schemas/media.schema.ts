import { z } from 'zod';

// ============ UPLOAD MEDIA (Used for presigned URL / direct upload info) ============
export const UploadMediaInputSchema = z.object({
  listingSlug: z.string().optional(), // Optional if uploading before listing exists
  fileName: z.string(),
  fileType: z.string(), // MIME type
  fileSize: z.number().int().positive().max(100 * 1024 * 1024), // Max 100MB
  mediaType: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
});

export const UploadMediaOutputSchema = z.object({
  uploadUrl: z.string().url(),
  publicId: z.string(),
  signature: z.string(),
  timestamp: z.number(),
  apiKey: z.string(),
  folder: z.string(),
});

export type UploadMediaInputType = z.infer<typeof UploadMediaInputSchema>;
export type UploadMediaOutputType = z.infer<typeof UploadMediaOutputSchema>;

// ============ CONFIRM UPLOAD (After successful Cloudinary upload) ============
export const ConfirmMediaUploadInputSchema = z.object({
  listingSlug: z.string(),
  publicId: z.string(),
  url: z.string().url(),
  mediaType: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  size: z.number().int().positive(),
  format: z.string(),
  isPrimary: z.boolean().default(false),
  alt: z.string().max(200).optional(),
});

export const ConfirmMediaUploadOutputSchema = z.object({
  id: z.string(),
  url: z.string(),
  isPrimary: z.boolean(),
});

export type ConfirmMediaUploadInputType = z.infer<typeof ConfirmMediaUploadInputSchema>;
export type ConfirmMediaUploadOutputType = z.infer<typeof ConfirmMediaUploadOutputSchema>;

// ============ UPLOAD VIA SERVER (For server-side upload from data URL or buffer) ============
export const ServerUploadMediaInputSchema = z.object({
  listingSlug: z.string(),
  dataUrl: z.string(), // Base64 data URL
  mediaType: z.enum(['IMAGE', 'VIDEO', 'DOCUMENT']),
  isPrimary: z.boolean().default(false),
  alt: z.string().max(200).optional(),
});

export const ServerUploadMediaOutputSchema = z.object({
  id: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
  isPrimary: z.boolean(),
});

export type ServerUploadMediaInputType = z.infer<typeof ServerUploadMediaInputSchema>;
export type ServerUploadMediaOutputType = z.infer<typeof ServerUploadMediaOutputSchema>;

