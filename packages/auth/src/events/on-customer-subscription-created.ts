import type Stripe from 'stripe';
import prisma from '@yayago-app/db';

export async function onCustomerSubscriptionCreated(event: Stripe.CustomerSubscriptionCreatedEvent) {
  console.log('🚀 ~ onCustomerSubscriptionCreated ~ event:', event);
  const subscription = event.data.object;
  console.log('🚀 ~ onCustomerSubscriptionCreated ~ subscription:', subscription);
  const userId = subscription.metadata?.userId;
  console.log('🚀 ~ onCustomerSubscriptionCreated ~ userId:', userId);

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      deletedAt: null,
    },
  });

  console.log('🚀 ~ onCustomerSubscriptionCreated ~ user:', user);
  if (!user) {
    console.error('❌ User not found');
    throw new Error('User not found');
  }

  const org = await prisma.organization.findFirst({
    where: {
      members: {
        some: {
          userId: user.id,
          role: 'OWNER',
        },
      },
    },
  });
  console.log('🚀 ~ onCustomerSubscriptionCreated ~ org:', org);

  if (org) {
    // do nothing
    console.log('🚀 ~ onCustomerSubscriptionCreated ~ org found, doing nothing');
    return;
  }

  const orgName = `${user.name}'s Organization`;
  console.log('🚀 ~ onCustomerSubscriptionCreated ~ orgName:', orgName);
  const orgSlug = `${user.username}_organization`;
  console.log('🚀 ~ onCustomerSubscriptionCreated ~ orgSlug:', orgSlug);

  await prisma.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: orgName,
        slug: orgSlug,
      },
    });
    console.log('🚀 ~ onCustomerSubscriptionCreated ~ organization:', organization);

    const member = await prisma.member.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        role: 'OWNER',
      },
    });
    console.log('🚀 ~ onCustomerSubscriptionCreated ~ member:', member);
  });

  console.log('🚀 ~ onCustomerSubscriptionCreated ~ done');
}
