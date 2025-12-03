import { z } from 'zod';

// Member roles in organization
export const MemberRoleSchema = z.enum(['owner', 'admin', 'member']);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

// ============ OUTPUT SCHEMAS ============

export const MemberOutputSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  userId: z.string(),
  role: z.string(),
  createdAt: z.date(),
  user: z.object({
    id: z.string(),
    name: z.string().nullable(),
    email: z.string(),
    image: z.string().nullable(),
  }),
});

export type MemberOutputType = z.infer<typeof MemberOutputSchema>;

// ============ LIST MEMBERS ============

export const ListMembersOutputSchema = z.object({
  members: z.array(MemberOutputSchema),
  total: z.number(),
  currentMembers: z.number(),
  maxMembers: z.number(),
  canAddMore: z.boolean(),
});

export type ListMembersOutputType = z.infer<typeof ListMembersOutputSchema>;

// ============ CREATE MEMBER ============

export const CreateMemberInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: MemberRoleSchema.exclude(['owner']), // Cannot create another owner
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export type CreateMemberInputType = z.infer<typeof CreateMemberInputSchema>;

export const CreateMemberOutputSchema = MemberOutputSchema;
export type CreateMemberOutputType = z.infer<typeof CreateMemberOutputSchema>;

// ============ UPDATE MEMBER ROLE ============

export const UpdateMemberRoleInputSchema = z.object({
  memberId: z.string(),
  role: MemberRoleSchema.exclude(['owner']), // Cannot change to owner
});

export type UpdateMemberRoleInputType = z.infer<typeof UpdateMemberRoleInputSchema>;

export const UpdateMemberRoleOutputSchema = MemberOutputSchema;
export type UpdateMemberRoleOutputType = z.infer<typeof UpdateMemberRoleOutputSchema>;

// ============ REMOVE MEMBER ============

export const RemoveMemberInputSchema = z.object({
  memberId: z.string(),
});

export type RemoveMemberInputType = z.infer<typeof RemoveMemberInputSchema>;

export const RemoveMemberOutputSchema = z.object({
  success: z.boolean(),
});

export type RemoveMemberOutputType = z.infer<typeof RemoveMemberOutputSchema>;

// ============ CHECK USER AVAILABILITY ============

export const CheckUserAvailabilityInputSchema = z.object({
  email: z.string().email(),
});

export type CheckUserAvailabilityInputType = z.infer<typeof CheckUserAvailabilityInputSchema>;

export const CheckUserAvailabilityOutputSchema = z.object({
  available: z.boolean(),
  reason: z.string().optional(), // e.g., "User already belongs to another organization"
});

export type CheckUserAvailabilityOutputType = z.infer<typeof CheckUserAvailabilityOutputSchema>;

