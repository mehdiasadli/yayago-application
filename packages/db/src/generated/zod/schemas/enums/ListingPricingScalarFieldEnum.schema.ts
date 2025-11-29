import * as z from 'zod';

export const ListingPricingScalarFieldEnumSchema = z.enum(['id', 'listingId', 'currency', 'pricePerHour', 'pricePerDay', 'pricePerThreeDays', 'pricePerWeek', 'pricePerMonth', 'weekendPricePerDay', 'dynamicPricingRules', 'depositAmount', 'securityDepositRequired', 'securityDepositAmount', 'acceptsSecurityDepositWaiver', 'securityDepositWaiverCost', 'cancellationPolicy', 'cancellationFee', 'refundableDepositAmount', 'cancelGracePeriodHours', 'partialDayPolicy', 'pricingMode', 'taxRate'])

export type ListingPricingScalarFieldEnum = z.infer<typeof ListingPricingScalarFieldEnumSchema>;