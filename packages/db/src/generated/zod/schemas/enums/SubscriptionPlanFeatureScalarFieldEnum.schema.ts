import * as z from 'zod';

export const SubscriptionPlanFeatureScalarFieldEnumSchema = z.enum(['id', 'planId', 'name', 'description', 'isIncluded', 'sortOrder'])

export type SubscriptionPlanFeatureScalarFieldEnum = z.infer<typeof SubscriptionPlanFeatureScalarFieldEnumSchema>;