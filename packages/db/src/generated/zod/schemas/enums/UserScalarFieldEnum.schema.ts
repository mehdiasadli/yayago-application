import * as z from 'zod';

export const UserScalarFieldEnumSchema = z.enum(['id', 'name', 'email', 'emailVerified', 'image', 'createdAt', 'updatedAt', 'deletedAt', 'username', 'displayUsername', 'role', 'banned', 'banReason', 'banExpires', 'phoneNumber', 'phoneNumberVerified', 'stripeCustomerId'])

export type UserScalarFieldEnum = z.infer<typeof UserScalarFieldEnumSchema>;