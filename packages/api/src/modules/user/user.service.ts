import prisma from '@yayago-app/db';
import type {
  FindOneUserInputType,
  FindOneUserOutputType,
  ListUsersInputType,
  ListUsersOutputType,
  UpdateUserRoleInputType,
  UpdateUserRoleOutputType,
  BanUserInputType,
  BanUserOutputType,
  UnbanUserInputType,
  UnbanUserOutputType,
} from '@yayago-app/validators/schemas/user.schema';
import { getPagination, paginate } from '../__shared__/utils';
import { ORPCError } from '@orpc/client';

export class UserService {
  static async list(input: ListUsersInputType): Promise<ListUsersOutputType> {
    const { page, take, q, role, banned } = input;

    const where = {
      deletedAt: null,
      ...(q && {
        OR: [
          { name: { contains: q, mode: 'insensitive' as const } },
          { email: { contains: q, mode: 'insensitive' as const } },
          { username: { contains: q, mode: 'insensitive' as const } },
        ],
      }),
      ...(role && { role }),
      ...(banned !== undefined && { banned }),
    };

    const [data, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        ...getPagination({ page, take }),
        orderBy: { createdAt: 'desc' },
        select: {
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
        },
      }),
      prisma.user.count({ where }),
    ]);

    return paginate(data, page, take, total);
  }

  static async findOne(input: FindOneUserInputType): Promise<FindOneUserOutputType> {
    const { username } = input;

    const user = await prisma.user.findUnique({
      where: { username, deletedAt: null },
      select: {
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
      },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    return user;
  }

  static async updateRole(input: UpdateUserRoleInputType): Promise<UpdateUserRoleOutputType> {
    const { username, role } = input;

    const user = await prisma.user.update({
      where: { username, deletedAt: null },
      data: { role },
      select: {
        role: true,
      },
    });

    return user;
  }

  static async banUser(input: BanUserInputType): Promise<BanUserOutputType> {
    const { username, reason, expiresAt } = input;

    const existingUser = await prisma.user.findUnique({
      where: { username, deletedAt: null },
      select: { id: true, banned: true },
    });

    if (!existingUser) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    if (existingUser.banned) {
      throw new ORPCError('CONFLICT', { message: 'User is already banned' });
    }

    const user = await prisma.user.update({
      where: { username },
      data: {
        banned: true,
        banReason: reason || null,
        banExpires: expiresAt || null,
      },
      select: {
        username: true,
        banned: true,
        banReason: true,
        banExpires: true,
      },
    });

    return user;
  }

  static async unbanUser(input: UnbanUserInputType): Promise<UnbanUserOutputType> {
    const { username } = input;

    const existingUser = await prisma.user.findUnique({
      where: { username, deletedAt: null },
      select: { id: true, banned: true },
    });

    if (!existingUser) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    if (!existingUser.banned) {
      throw new ORPCError('CONFLICT', { message: 'User is not banned' });
    }

    const user = await prisma.user.update({
      where: { username },
      data: {
        banned: false,
        banReason: null,
        banExpires: null,
      },
      select: {
        username: true,
        banned: true,
      },
    });

    return user;
  }

  static async checkUserSubscription(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new ORPCError('NOT_FOUND', { message: 'User not found' });
    }

    const subscription = await prisma.subscription.findFirst({
      where: {
        stripeCustomerId: user.stripeCustomerId,
      },
      select: {
        status: true,
        periodStart: true,
        periodEnd: true,
        plan: true,
        trialStart: true,
        trialEnd: true,
        organization: {
          where: {
            deletedAt: null,
            status: { notIn: ['SUSPENDED', 'ARCHIVED'] },
          },
          select: {
            status: true,
            members: {
              where: {
                userId: user.id,
              },
            },
          },
        },
      },
    });

    if (!subscription) {
      return null;
    }

    return subscription;
  }
}
