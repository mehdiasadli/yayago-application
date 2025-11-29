import { SubscriptionPlanService } from './subscription-plan.service';
import {
  // Plan
  CreateSubscriptionPlanInputSchema,
  CreateSubscriptionPlanOutputSchema,
  ListSubscriptionPlansInputSchema,
  ListSubscriptionPlansOutputSchema,
  FindOneSubscriptionPlanInputSchema,
  FindOneSubscriptionPlanOutputSchema,
  UpdateSubscriptionPlanInputSchema,
  UpdateSubscriptionPlanOutputSchema,
  DeleteSubscriptionPlanInputSchema,
  DeleteSubscriptionPlanOutputSchema,
  // Price
  CreateSubscriptionPlanPriceInputSchema,
  CreateSubscriptionPlanPriceOutputSchema,
  UpdateSubscriptionPlanPriceInputSchema,
  UpdateSubscriptionPlanPriceOutputSchema,
  DeleteSubscriptionPlanPriceInputSchema,
  DeleteSubscriptionPlanPriceOutputSchema,
  // Feature
  CreateSubscriptionPlanFeatureInputSchema,
  CreateSubscriptionPlanFeatureOutputSchema,
  UpdateSubscriptionPlanFeatureInputSchema,
  UpdateSubscriptionPlanFeatureOutputSchema,
  DeleteSubscriptionPlanFeatureInputSchema,
  DeleteSubscriptionPlanFeatureOutputSchema,
  // Public
  GetPublicSubscriptionPlansOutputSchema,
} from '@yayago-app/validators';
import { procedures } from '../../procedures';

export default {
  // ==========================================
  // SUBSCRIPTION PLAN (Admin only)
  // ==========================================
  create: procedures
    .withRoles('admin')
    .input(CreateSubscriptionPlanInputSchema)
    .output(CreateSubscriptionPlanOutputSchema)
    .handler(async ({ input, context }) => await SubscriptionPlanService.create(input, context.locale)),

  list: procedures
    .withRoles('admin', 'moderator')
    .input(ListSubscriptionPlansInputSchema)
    .output(ListSubscriptionPlansOutputSchema)
    .handler(async ({ input, context }) => await SubscriptionPlanService.list(input, context.locale)),

  findOne: procedures
    .withRoles('admin', 'moderator')
    .input(FindOneSubscriptionPlanInputSchema)
    .output(FindOneSubscriptionPlanOutputSchema)
    .handler(async ({ input, context }) => await SubscriptionPlanService.findOne(input, context.locale)),

  update: procedures
    .withRoles('admin')
    .input(UpdateSubscriptionPlanInputSchema)
    .output(UpdateSubscriptionPlanOutputSchema)
    .handler(async ({ input, context }) => await SubscriptionPlanService.update(input, context.locale)),

  delete: procedures
    .withRoles('admin')
    .input(DeleteSubscriptionPlanInputSchema)
    .output(DeleteSubscriptionPlanOutputSchema)
    .handler(async ({ input }) => await SubscriptionPlanService.delete(input)),

  // ==========================================
  // SUBSCRIPTION PLAN PRICE (Admin only)
  // ==========================================
  createPrice: procedures
    .withRoles('admin')
    .input(CreateSubscriptionPlanPriceInputSchema)
    .output(CreateSubscriptionPlanPriceOutputSchema)
    .handler(async ({ input }) => await SubscriptionPlanService.createPrice(input)),

  updatePrice: procedures
    .withRoles('admin')
    .input(UpdateSubscriptionPlanPriceInputSchema)
    .output(UpdateSubscriptionPlanPriceOutputSchema)
    .handler(async ({ input }) => await SubscriptionPlanService.updatePrice(input)),

  deletePrice: procedures
    .withRoles('admin')
    .input(DeleteSubscriptionPlanPriceInputSchema)
    .output(DeleteSubscriptionPlanPriceOutputSchema)
    .handler(async ({ input }) => await SubscriptionPlanService.deletePrice(input)),

  // ==========================================
  // SUBSCRIPTION PLAN FEATURE (Admin only)
  // ==========================================
  createFeature: procedures
    .withRoles('admin')
    .input(CreateSubscriptionPlanFeatureInputSchema)
    .output(CreateSubscriptionPlanFeatureOutputSchema)
    .handler(async ({ input, context }) => await SubscriptionPlanService.createFeature(input, context.locale)),

  updateFeature: procedures
    .withRoles('admin')
    .input(UpdateSubscriptionPlanFeatureInputSchema)
    .output(UpdateSubscriptionPlanFeatureOutputSchema)
    .handler(async ({ input, context }) => await SubscriptionPlanService.updateFeature(input, context.locale)),

  deleteFeature: procedures
    .withRoles('admin')
    .input(DeleteSubscriptionPlanFeatureInputSchema)
    .output(DeleteSubscriptionPlanFeatureOutputSchema)
    .handler(async ({ input }) => await SubscriptionPlanService.deleteFeature(input)),

  // ==========================================
  // PUBLIC (for pricing page)
  // ==========================================
  getPublicPlans: procedures.public
    .output(GetPublicSubscriptionPlansOutputSchema)
    .handler(async ({ context }) => await SubscriptionPlanService.getPublicPlans(context.locale)),
};
