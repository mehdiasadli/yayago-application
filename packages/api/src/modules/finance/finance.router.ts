import { FinanceService } from './finance.service';
import { procedures } from '../../procedures';
import {
  GetFinanceOverviewInputSchema,
  GetFinanceOverviewOutputSchema,
  ListTransactionsInputSchema,
  ListTransactionsOutputSchema,
  GetTransactionInputSchema,
  GetTransactionOutputSchema,
  ListCustomersInputSchema,
  ListCustomersOutputSchema,
  GetCustomerInputSchema,
  GetCustomerOutputSchema,
  ListFinanceSubscriptionsInputSchema,
  ListFinanceSubscriptionsOutputSchema,
  GetFinanceSubscriptionInputSchema,
  GetFinanceSubscriptionOutputSchema,
  GetPlansPerformanceInputSchema,
  GetPlansPerformanceOutputSchema,
  ListInvoicesInputSchema,
  ListInvoicesOutputSchema,
  ListRefundsInputSchema,
  ListRefundsOutputSchema,
  ListPayoutsInputSchema,
  ListPayoutsOutputSchema,
  GetBalanceOutputSchema,
  CreateRefundInputSchema,
  CreateRefundOutputSchema,
} from '@yayago-app/validators';

export const finance = {
  // ============ OVERVIEW ============
  getOverview: procedures
    .withRoles('admin', 'moderator')
    .input(GetFinanceOverviewInputSchema)
    .output(GetFinanceOverviewOutputSchema)
    .handler(async ({ input }) => FinanceService.getOverview(input)),

  // ============ TRANSACTIONS ============
  listTransactions: procedures
    .withRoles('admin', 'moderator')
    .input(ListTransactionsInputSchema)
    .output(ListTransactionsOutputSchema)
    .handler(async ({ input }) => FinanceService.listTransactions(input)),

  getTransaction: procedures
    .withRoles('admin', 'moderator')
    .input(GetTransactionInputSchema)
    .output(GetTransactionOutputSchema)
    .handler(async ({ input }) => FinanceService.getTransaction(input)),

  // ============ CUSTOMERS ============
  listCustomers: procedures
    .withRoles('admin', 'moderator')
    .input(ListCustomersInputSchema)
    .output(ListCustomersOutputSchema)
    .handler(async ({ input }) => FinanceService.listCustomers(input)),

  getCustomer: procedures
    .withRoles('admin', 'moderator')
    .input(GetCustomerInputSchema)
    .output(GetCustomerOutputSchema)
    .handler(async ({ input }) => FinanceService.getCustomer(input)),

  // ============ SUBSCRIPTIONS ============
  listSubscriptions: procedures
    .withRoles('admin', 'moderator')
    .input(ListFinanceSubscriptionsInputSchema)
    .output(ListFinanceSubscriptionsOutputSchema)
    .handler(async ({ input }) => FinanceService.listSubscriptions(input)),

  getSubscription: procedures
    .withRoles('admin', 'moderator')
    .input(GetFinanceSubscriptionInputSchema)
    .output(GetFinanceSubscriptionOutputSchema)
    .handler(async ({ input }) => FinanceService.getSubscription(input)),

  // ============ PLANS PERFORMANCE ============
  getPlansPerformance: procedures
    .withRoles('admin', 'moderator')
    .input(GetPlansPerformanceInputSchema)
    .output(GetPlansPerformanceOutputSchema)
    .handler(async ({ input }) => FinanceService.getPlansPerformance(input)),

  // ============ INVOICES ============
  listInvoices: procedures
    .withRoles('admin', 'moderator')
    .input(ListInvoicesInputSchema)
    .output(ListInvoicesOutputSchema)
    .handler(async ({ input }) => FinanceService.listInvoices(input)),

  // ============ REFUNDS ============
  listRefunds: procedures
    .withRoles('admin', 'moderator')
    .input(ListRefundsInputSchema)
    .output(ListRefundsOutputSchema)
    .handler(async ({ input }) => FinanceService.listRefunds(input)),

  createRefund: procedures
    .withRoles('admin', 'moderator')
    .input(CreateRefundInputSchema)
    .output(CreateRefundOutputSchema)
    .handler(async ({ input }) => FinanceService.createRefund(input)),

  // ============ PAYOUTS ============
  listPayouts: procedures
    .withRoles('admin', 'moderator')
    .input(ListPayoutsInputSchema)
    .output(ListPayoutsOutputSchema)
    .handler(async ({ input }) => FinanceService.listPayouts(input)),

  // ============ BALANCE ============
  getBalance: procedures
    .withRoles('admin', 'moderator')
    .output(GetBalanceOutputSchema)
    .handler(async () => FinanceService.getBalance()),
};
