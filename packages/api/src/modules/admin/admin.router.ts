import {
  GetAdminDashboardStatsOutputSchema,
  GetAnalyticsInputSchema,
  GetAnalyticsOutputSchema,
} from '@yayago-app/validators';
import { procedures } from '../../procedures';
import { AdminService } from './admin.service';
import { AnalyticsService } from './analytics.service';

export default {
  // Get dashboard stats (admin only)
  getDashboardStats: procedures
    .withRoles('admin', 'moderator')
    .output(GetAdminDashboardStatsOutputSchema)
    .handler(async () => await AdminService.getDashboardStats()),

  // Get analytics data (admin only)
  getAnalytics: procedures
    .withRoles('admin', 'moderator')
    .input(GetAnalyticsInputSchema)
    .output(GetAnalyticsOutputSchema)
    .handler(async ({ input }) => await AnalyticsService.getAnalytics(input)),
};
