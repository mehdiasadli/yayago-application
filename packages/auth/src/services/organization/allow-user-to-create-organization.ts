import prisma from '@yayago-app/db';
import type { User } from 'better-auth';

export async function allowUserToCreateOrganization(user: User & Record<string, any>) {
  const stripeCustomerId = user.stripeCustomerId;

  if (!stripeCustomerId) {
    return false;
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      stripeCustomerId,
      status: {
        in: ['active', 'trialing'],
      },
    },
  });

  return !!subscription;
}
