import * as z from 'zod';

export const BookingAddonScalarFieldEnumSchema = z.enum(['id', 'createdAt', 'updatedAt', 'bookingId', 'listingAddonId', 'addonSnapshot', 'quantity', 'selectedOption', 'unitPrice', 'totalPrice', 'currency', 'discountApplied', 'taxAmount', 'status', 'cancelledAt', 'cancelledReason', 'refundAmount'])

export type BookingAddonScalarFieldEnum = z.infer<typeof BookingAddonScalarFieldEnumSchema>;