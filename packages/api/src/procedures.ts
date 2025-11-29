import { ORPCError } from '@orpc/client';
import { o } from '.';
import { enums } from '@yayago-app/validators';

const requireAuth = o.middleware(async ({ context, next }) => {
  console.log('context', context);

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

export const procedures = {
  public: publicProcedure,
  protected: protecedProcedure,
  withRoles: roleProcedure,
};
