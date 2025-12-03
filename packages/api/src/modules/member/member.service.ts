import prisma from '@yayago-app/db';
import { auth } from '@yayago-app/auth';
import type {
  CreateMemberInputType,
  CreateMemberOutputType,
  ListMembersOutputType,
  UpdateMemberRoleInputType,
  UpdateMemberRoleOutputType,
  RemoveMemberInputType,
  RemoveMemberOutputType,
  CheckUserAvailabilityInputType,
  CheckUserAvailabilityOutputType,
} from '@yayago-app/validators';
import { ORPCError } from '@orpc/client';

export class MemberService {
  static async generateUsername(email: string) {
    const emailUsername = (email.split('@')[0] || '').replace(/[^a-zA-Z0-9_]/g, '');
    let usernameExists = true;
    let username = emailUsername;

    // check if exists
    while (usernameExists) {
      const user = await prisma.user.findFirst({
        where: { username },
      });

      if (!user) {
        usernameExists = false;
        break;
      }

      const randomDigit = Math.floor(1 + Math.random() * 9).toString();
      username = `${username}${randomDigit}`;
    }

    return username;
  }

  /**
   * Check if a user is a member of any organization
   */
  static async isMemberOfAnyOrganization(userId?: string) {
    if (!userId) {
      return null;
    }

    const member = await prisma.member.findFirst({
      where: {
        userId,
      },
      select: {
        id: true,
        role: true,
        organization: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!member) {
      return null;
    }

    return {
      id: member.id,
      role: member.role,
      organizationSlug: member.organization.slug,
    };
  }

  /**
   * Get the current user's organization ID and verify they are owner
   */
  static async getOrganizationAsOwner(userId: string) {
    const member = await prisma.member.findFirst({
      where: { userId },
      include: {
        organization: {
          include: {
            subscriptions: {
              where: { status: { in: ['active', 'trialing'] } },
              orderBy: { periodEnd: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!member) {
      throw new ORPCError('NOT_FOUND', { message: 'You are not a member of any organization' });
    }

    if (member.role !== 'owner') {
      throw new ORPCError('FORBIDDEN', { message: 'Only organization owners can manage team members' });
    }

    return {
      organizationId: member.organizationId,
      organization: member.organization,
      subscription: member.organization.subscriptions[0] || null,
    };
  }

  /**
   * List all members of an organization
   */
  static async listMembers(userId: string): Promise<ListMembersOutputType> {
    const { organizationId, subscription } = await this.getOrganizationAsOwner(userId);

    const members = await prisma.member.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    });

    const maxMembers = subscription?.maxMembers || 1;
    const currentMembers = members.length;

    return {
      members: members.map((m) => ({
        id: m.id,
        organizationId: m.organizationId,
        userId: m.userId,
        role: m.role,
        createdAt: m.createdAt,
        user: {
          id: m.user.id,
          name: m.user.name,
          email: m.user.email,
          image: m.user.image,
        },
      })),
      total: members.length,
      currentMembers,
      maxMembers,
      canAddMore: currentMembers < maxMembers,
    };
  }

  /**
   * Check if an email is available for creating a new member
   * - User must not exist OR must not be a member of any organization
   */
  static async checkUserAvailability(input: CheckUserAvailabilityInputType): Promise<CheckUserAvailabilityOutputType> {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      include: {
        members: true,
      },
    });

    // User doesn't exist - can create new user
    if (!existingUser) {
      return { available: true };
    }

    // User exists and is already a member of an organization
    if (existingUser.members.length > 0) {
      return {
        available: false,
        reason: 'This user already belongs to another organization',
      };
    }

    // User exists but is not a member of any organization - can be added
    return {
      available: false,
      reason: 'User with this email already exists. They need to be invited or added differently.',
    };
  }

  /**
   * Create a new member (creates user and adds to organization)
   * Only owners can create members
   */
  static async createMember(userId: string, input: CreateMemberInputType): Promise<CreateMemberOutputType> {
    const { organizationId, subscription } = await this.getOrganizationAsOwner(userId);

    // Check member limit
    const currentMemberCount = await prisma.member.count({
      where: { organizationId },
    });

    const maxMembers = subscription?.maxMembers || 1;
    if (currentMemberCount >= maxMembers) {
      throw new ORPCError('BAD_REQUEST', {
        message: `You have reached the maximum number of members (${maxMembers}). Please upgrade your subscription to add more members.`,
      });
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
      include: { members: true },
    });

    if (existingUser) {
      if (existingUser.members.length > 0) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'This user already belongs to another organization',
        });
      }

      throw new ORPCError('BAD_REQUEST', {
        message: 'A user with this email already exists',
      });

      // TODO: implement invitation system
      // User exists but not a member - add them to organization
      // const member = await prisma.member.create({
      //   data: {
      //     userId: existingUser.id,
      //     organizationId,
      //     role: input.role,
      //   },
      //   include: {
      //     user: {
      //       select: {
      //         id: true,
      //         name: true,
      //         email: true,
      //         image: true,
      //       },
      //     },
      //   },
      // });

      // // Update subscription current members count
      // if (subscription) {
      //   await prisma.subscription.update({
      //     where: { id: subscription.id },
      //     data: { currentMembers: { increment: 1 } },
      //   });
      // }

      // return {
      //   id: member.id,
      //   organizationId: member.organizationId,
      //   userId: member.userId,
      //   role: member.role,
      //   createdAt: member.createdAt,
      //   user: {
      //     id: member.user.id,
      //     name: member.user.name,
      //     email: member.user.email,
      //     image: member.user.image,
      //   },
      // };
    }

    // Create new user with better-auth admin API
    const username = await MemberService.generateUsername(input.email);

    try {
      const newUser = await auth.api.signUpEmail({
        body: {
          email: input.email,
          password: input.password,
          name: input.name,
          username,
          displayUsername: username,
        },
      });

      if (!newUser || !newUser.user) {
        throw new ORPCError('INTERNAL_SERVER_ERROR', {
          message: 'Failed to create user account',
        });
      }

      // Create member record
      const member = await prisma.member.create({
        data: {
          userId: newUser.user.id,
          organizationId,
          role: input.role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
      });

      // Update subscription current members count
      if (subscription) {
        await prisma.subscription.update({
          where: { id: subscription.id },
          data: { currentMembers: { increment: 1 } },
        });
      }

      return {
        id: member.id,
        organizationId: member.organizationId,
        userId: member.userId,
        role: member.role,
        createdAt: member.createdAt,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          image: member.user.image,
        },
      };
    } catch (error: any) {
      // Handle better-auth specific errors
      if (error.message?.includes('already exists')) {
        throw new ORPCError('BAD_REQUEST', {
          message: 'A user with this email already exists',
        });
      }
      throw error;
    }
  }

  /**
   * Update a member's role
   * Only owners can update roles, and cannot change the owner role
   */
  static async updateMemberRole(userId: string, input: UpdateMemberRoleInputType): Promise<UpdateMemberRoleOutputType> {
    const { organizationId } = await this.getOrganizationAsOwner(userId);

    // Find the member
    const member = await prisma.member.findFirst({
      where: {
        id: input.memberId,
        organizationId,
      },
    });

    if (!member) {
      throw new ORPCError('NOT_FOUND', { message: 'Member not found' });
    }

    // Cannot change owner's role
    if (member.role === 'owner') {
      throw new ORPCError('BAD_REQUEST', { message: "Cannot change the owner's role" });
    }

    // Update the role
    const updatedMember = await prisma.member.update({
      where: { id: input.memberId },
      data: { role: input.role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return {
      id: updatedMember.id,
      organizationId: updatedMember.organizationId,
      userId: updatedMember.userId,
      role: updatedMember.role,
      createdAt: updatedMember.createdAt,
      user: {
        id: updatedMember.user.id,
        name: updatedMember.user.name,
        email: updatedMember.user.email,
        image: updatedMember.user.image,
      },
    };
  }

  /**
   * Remove a member from the organization
   * Only owners can remove members, and cannot remove themselves
   */
  static async removeMember(userId: string, input: RemoveMemberInputType): Promise<RemoveMemberOutputType> {
    const { organizationId, subscription } = await this.getOrganizationAsOwner(userId);

    // Find the member
    const member = await prisma.member.findFirst({
      where: {
        id: input.memberId,
        organizationId,
      },
    });

    if (!member) {
      throw new ORPCError('NOT_FOUND', { message: 'Member not found' });
    }

    // Cannot remove owner
    if (member.role === 'owner') {
      throw new ORPCError('BAD_REQUEST', { message: 'Cannot remove the organization owner' });
    }

    // Cannot remove yourself (even if you're not owner, this is an extra safety)
    if (member.userId === userId) {
      throw new ORPCError('BAD_REQUEST', { message: 'You cannot remove yourself from the organization' });
    }

    // Delete the member
    await prisma.member.delete({
      where: { id: input.memberId },
    });

    // Update subscription current members count
    if (subscription) {
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { currentMembers: { decrement: 1 } },
      });
    }

    return { success: true };
  }
}
