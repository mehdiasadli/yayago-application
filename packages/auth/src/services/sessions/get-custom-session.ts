import prisma from '@yayago-app/db';
import type { Session, User } from 'better-auth';

export async function getCustomSession(user: User, session: Session) {
  const organization = await prisma.organization.findFirst({
    where: {
      deletedAt: null,
      members: {
        some: {
          user: {
            id: user.id,
            deletedAt: null,
          },
        },
      },
    },
    select: {
      slug: true,
      name: true,
      id: true,
      status: true,
      rejectionReason: true,
      banReason: true,
      members: {
        where: {
          userId: user.id,
        },
        select: {
          role: true,
        },
      },
    },
  });

  // Extract member info from organization
  const member = organization?.members?.[0] || null;

  return {
    user,
    session,
    organization: organization
      ? {
          id: organization.id,
          slug: organization.slug,
          name: organization.name,
          status: organization.status,
          rejectionReason: organization.rejectionReason,
          banReason: organization.banReason,
        }
      : null,
    member: member
      ? {
          role: member.role,
        }
      : null,
  };
}
