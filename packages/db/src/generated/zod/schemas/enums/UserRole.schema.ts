import * as z from 'zod';

export const UserRoleSchema = z.enum(['user', 'moderator', 'admin'])

export type UserRole = z.infer<typeof UserRoleSchema>;