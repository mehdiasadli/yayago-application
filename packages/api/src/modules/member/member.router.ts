import { procedures } from '../../procedures';
import { MemberService } from './member.service';
import {
  ListMembersOutputSchema,
  CreateMemberInputSchema,
  CreateMemberOutputSchema,
  UpdateMemberRoleInputSchema,
  UpdateMemberRoleOutputSchema,
  RemoveMemberInputSchema,
  RemoveMemberOutputSchema,
  CheckUserAvailabilityInputSchema,
  CheckUserAvailabilityOutputSchema,
} from '@yayago-app/validators';

export default {
  // Check if current user is a member of any organization (public)
  isMemberOfAnyOrganization: procedures.public.handler(
    async ({ context: { session } }) => await MemberService.isMemberOfAnyOrganization(session?.user?.id)
  ),

  // List all members of the current user's organization (owner only)
  list: procedures.protected
    .output(ListMembersOutputSchema)
    .handler(async ({ context: { session } }) => {
      return MemberService.listMembers(session.user.id);
    }),

  // Create a new member (owner only)
  create: procedures.protected
    .input(CreateMemberInputSchema)
    .output(CreateMemberOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return MemberService.createMember(session.user.id, input);
    }),

  // Update member role (owner only)
  updateRole: procedures.protected
    .input(UpdateMemberRoleInputSchema)
    .output(UpdateMemberRoleOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return MemberService.updateMemberRole(session.user.id, input);
    }),

  // Remove a member (owner only)
  remove: procedures.protected
    .input(RemoveMemberInputSchema)
    .output(RemoveMemberOutputSchema)
    .handler(async ({ input, context: { session } }) => {
      return MemberService.removeMember(session.user.id, input);
    }),

  // Check if an email is available for adding as member
  checkAvailability: procedures.protected
    .input(CheckUserAvailabilityInputSchema)
    .output(CheckUserAvailabilityOutputSchema)
    .handler(async ({ input }) => {
      return MemberService.checkUserAvailability(input);
    }),
};
