import { GetAdminDashboardStatsOutputSchema } from '@yayago-app/validators';
import { procedures } from '../../procedures';
import { AdminService } from './admin.service';

export default {
  // Get dashboard stats (admin only)
  getDashboardStats: procedures
    .withRoles('admin', 'moderator')
    .output(GetAdminDashboardStatsOutputSchema)
    .handler(async () => await AdminService.getDashboardStats()),
};
