import { UserSchema } from '@yayago-app/db/models';
import z from 'zod';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';
import { UserRoleSchema } from '@yayago-app/db/enums';

export const ListUsersInputSchema = z
  .object({
    q: z.string().optional(),
    role: UserRoleSchema.optional(),
    banned: z.boolean().optional(),
  })
  .extend(PaginationInputSchema.shape);

export const ListUsersOutputSchema = PaginationOutputSchema(
  UserSchema.pick({
    name: true,
    email: true,
    username: true,
    role: true,
    banned: true,
    createdAt: true,
    emailVerified: true,
    image: true,
    phoneNumber: true,
    phoneNumberVerified: true,
  })
);

export type ListUsersInputType = z.infer<typeof ListUsersInputSchema>;
export type ListUsersOutputType = z.infer<typeof ListUsersOutputSchema>;

export const FindOneUserInputSchema = UserSchema.pick({
  username: true,
});

export const FindOneUserOutputSchema = UserSchema.pick({
  name: true,
  email: true,
  username: true,
  role: true,
  banned: true,
  createdAt: true,
  emailVerified: true,
  image: true,
  phoneNumber: true,
  phoneNumberVerified: true,
  banExpires: true,
  banReason: true,
  stripeCustomerId: true,
  updatedAt: true,
});

export type FindOneUserInputType = z.infer<typeof FindOneUserInputSchema>;
export type FindOneUserOutputType = z.infer<typeof FindOneUserOutputSchema>;

export const UpdateUserRoleInputSchema = UserSchema.pick({
  username: true,
  role: true,
});

export const UpdateUserRoleOutputSchema = UserSchema.pick({
  role: true,
});

export type UpdateUserRoleInputType = z.infer<typeof UpdateUserRoleInputSchema>;
export type UpdateUserRoleOutputType = z.infer<typeof UpdateUserRoleOutputSchema>;

// Ban User
export const BanUserInputSchema = z.object({
  username: z.string().min(1),
  reason: z.string().min(1).max(500).optional(),
  expiresAt: z.coerce.date().optional(),
});

export const BanUserOutputSchema = UserSchema.pick({
  username: true,
  banned: true,
  banReason: true,
  banExpires: true,
});

export type BanUserInputType = z.infer<typeof BanUserInputSchema>;
export type BanUserOutputType = z.infer<typeof BanUserOutputSchema>;

// Unban User
export const UnbanUserInputSchema = z.object({
  username: z.string().min(1),
});

export const UnbanUserOutputSchema = UserSchema.pick({
  username: true,
  banned: true,
});

export type UnbanUserInputType = z.infer<typeof UnbanUserInputSchema>;
export type UnbanUserOutputType = z.infer<typeof UnbanUserOutputSchema>;
