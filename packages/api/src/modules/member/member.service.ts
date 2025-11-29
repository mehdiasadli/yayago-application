import prisma from '@yayago-app/db';

export class MemberService {
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
}
