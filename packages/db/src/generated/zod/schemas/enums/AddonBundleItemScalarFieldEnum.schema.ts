import * as z from 'zod';

export const AddonBundleItemScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'bundleId', 'addonId', 'quantity', 'isRequired'])

export type AddonBundleItemScalarFieldEnum = z.infer<typeof AddonBundleItemScalarFieldEnumSchema>;