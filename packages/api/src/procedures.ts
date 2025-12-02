import { ORPCError } from '@orpc/client';
import { o } from '.';
import { enums } from '@yayago-app/validators';

const requireAuth = o.middleware(async ({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError('UNAUTHORIZED', {
      message: 'unauthorized',
    });
  }

  return next({
    context: {
      ...context,
      session: context.session,
    },
  });
});

const requireRole = (...roles: enums.UserRole[]) => {
  return o.middleware(async ({ context, next }) => {
    if (!context.session?.user) {
      throw new ORPCError('UNAUTHORIZED', {
        message: 'unauthorized',
      });
    }

    if (!roles.includes((context.session.user as any).role)) {
      throw new ORPCError('FORBIDDEN', {
        message: 'forbidden',
      });
    }

    return next({
      context: {
        ...context,
        session: context.session!,
      },
    });
  });
};

const publicProcedure = o;
const protecedProcedure = publicProcedure.use(requireAuth);
const roleProcedure = (...roles: enums.UserRole[]) => protecedProcedure.use(requireRole(...roles));

// Role-specific procedures
const adminProcedure = roleProcedure('admin');
const moderatorProcedure = roleProcedure('admin', 'moderator');

// Partner procedure - requires user to be a member of an organization
const partnerProcedure = protecedProcedure.use(
  o.middleware(async ({ context, next }) => {
    // Partners are users who belong to an active organization
    // The actual organization check is done in the service layer
    return next({
      context: {
        ...context,
        session: context.session!,
      },
    });
  })
);

export const procedures = {
  public: publicProcedure,
  protected: protecedProcedure,
  withRoles: roleProcedure,
  admin: adminProcedure,
  moderator: moderatorProcedure,
  partner: partnerProcedure,
};
