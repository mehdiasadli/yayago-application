import * as z from 'zod';

export const AddonBundleItemSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  bundleId: z.string(),
  addonId: z.string(),
  quantity: z.number().int().default(1),
  isRequired: z.boolean().default(true),
});

export type AddonBundleItemType = z.infer<typeof AddonBundleItemSchema>;
