import {
  FindOneUserInputSchema,
  FindOneUserOutputSchema,
  UpdateUserRoleOutputSchema,
  UpdateUserRoleInputSchema,
  ListUsersInputSchema,
  ListUsersOutputSchema,
  BanUserInputSchema,
  BanUserOutputSchema,
  UnbanUserInputSchema,
  UnbanUserOutputSchema,
} from '@yayago-app/validators/schemas/user.schema';
import { procedures } from '../../procedures';
import { UserService } from './user.service';

export default {
  list: procedures
    .withRoles('admin', 'moderator')
    .input(ListUsersInputSchema)
    .output(ListUsersOutputSchema)
    .handler(async ({ input }) => await UserService.list(input)),
  findOne: procedures
    .withRoles('admin', 'moderator')
    .input(FindOneUserInputSchema)
    .output(FindOneUserOutputSchema)
    .handler(async ({ input }) => await UserService.findOne(input)),
  updateRole: procedures
    .withRoles('admin', 'moderator')
    .input(UpdateUserRoleInputSchema)
    .output(UpdateUserRoleOutputSchema)
    .handler(async ({ input }) => await UserService.updateRole(input)),
  banUser: procedures
    .withRoles('admin', 'moderator')
    .input(BanUserInputSchema)
    .output(BanUserOutputSchema)
    .handler(async ({ input }) => await UserService.banUser(input)),
  unbanUser: procedures
    .withRoles('admin', 'moderator')
    .input(UnbanUserInputSchema)
    .output(UnbanUserOutputSchema)
    .handler(async ({ input }) => await UserService.unbanUser(input)),
};
