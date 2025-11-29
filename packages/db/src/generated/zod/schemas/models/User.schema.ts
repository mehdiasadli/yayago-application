import * as z from 'zod';
import { UserRoleSchema } from '../enums/UserRole.schema';

export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullish(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
  username: z.string(),
  displayUsername: z.string().nullish(),
  role: UserRoleSchema.default("user"),
  banned: z.boolean().nullish(),
  banReason: z.string().nullish(),
  banExpires: z.date().nullish(),
  phoneNumber: z.string().nullish(),
  phoneNumberVerified: z.boolean().nullish(),
  stripeCustomerId: z.string().nullish(),
});

export type UserType = z.infer<typeof UserSchema>;
