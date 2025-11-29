# YayaGO Development Guide

> **Purpose**: This guide documents the architecture, patterns, and conventions used in the YayaGO monorepo. Follow these guidelines to maintain consistency across the codebase.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Apps Overview](#apps-overview)
3. [Packages Overview](#packages-overview)
4. [Frontend Patterns](#frontend-patterns)
5. [Backend Patterns](#backend-patterns)
6. [Stripe Integration](#stripe-integration)
7. [Build Process](#build-process)
8. [MVP Roadmap](#mvp-roadmap)

---

## Project Structure

```
yayago-app/
├── apps/
│   ├── admin/          # Admin dashboard (Next.js)
│   ├── partner/        # Partner/vendor dashboard (Next.js)
│   ├── web/            # Public website (Next.js)
│   ├── server/         # API server (Hono)
│   ├── docs/           # Documentation site
│   ├── native/         # Mobile app (React Native/Expo)
│   └── native-partner/ # Partner mobile app
│
├── packages/
│   ├── api/            # ORPC routers and services
│   ├── auth/           # Better Auth configuration + Stripe webhooks
│   ├── cloudinary/     # Cloudinary utilities
│   ├── db/             # Prisma client + generated Zod schemas
│   ├── i18n/           # Internationalization utilities
│   ├── stripe/         # Stripe client + sync utilities
│   ├── ui/             # Shared UI components (future)
│   └── validators/     # Zod schemas for API validation
│
└── tooling/            # Shared configs (ESLint, TypeScript, etc.)
```

---

## Apps Overview

### Admin App (`apps/admin`)

**Purpose**: Internal dashboard for YayaGO staff to manage:

- Organizations (approve/reject/suspend)
- Users (view/ban/unban)
- Subscription Plans (CRUD, Stripe sync)
- Vehicle Brands & Models
- Regions (Countries/Cities)
- Listings (verify/approve/reject)

**Structure**:

```
apps/admin/src/
├── app/
│   ├── (auth)/           # Login pages
│   ├── (dashboard)/      # Protected dashboard routes
│   │   ├── @organizations/
│   │   ├── @users/
│   │   ├── @plans/
│   │   ├── @vehicles/
│   │   └── @regions/
│   └── layout.tsx
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── data-table/       # Reusable data table components
│   ├── app-sidebar.tsx
│   ├── nav-main.tsx
│   └── form-input.tsx
├── lib/
│   ├── auth-client.ts    # Better Auth client
│   └── utils.ts
└── utils/
    └── orpc.ts           # ORPC client setup
```

### Partner App (`apps/partner`)

**Purpose**: Dashboard for rental companies/vendors to:

- Complete onboarding
- Manage listings (vehicles for rent)
- Handle bookings
- View analytics (premium feature)

**Structure**:

```
apps/partner/src/
├── app/
│   ├── (auth)/           # Login/signup
│   ├── (dashboard)/      # Protected routes
│   │   ├── listings/
│   │   │   ├── create/   # Multi-step listing creation
│   │   │   └── [slug]/   # Listing details/edit
│   │   ├── bookings/
│   │   └── settings/
│   └── onboarding/       # Multi-step onboarding flow
├── components/
│   ├── ui/
│   ├── form-input.tsx    # CRITICAL: Form field wrapper
│   ├── app-sidebar.tsx
│   └── organization-status-guard.tsx
├── contexts/
│   └── navigation-context.tsx  # Dynamic nav based on org status
└── lib/
    ├── auth-client.ts
    └── nav-data.tsx      # Navigation configuration
```

**Organization Status Flow**:

```
IDLE → ONBOARDING → PENDING → ACTIVE
                  ↘ REJECTED ↗
                    SUSPENDED
                    ARCHIVED
```

### Web App (`apps/web`)

**Purpose**: Public-facing website for:

- Browsing listings
- Searching/filtering vehicles
- Viewing listing details
- Making bookings (future)
- Pricing page

---

## Packages Overview

### Database (`packages/db`)

**Contains**:

- Prisma schema files in `prisma/schema/`
- Generated Prisma client
- Generated Zod schemas in `src/generated/zod/`

**Exports**:

```typescript
import prisma from '@yayago-app/db';
import { UserSchema } from '@yayago-app/db/models';
import { UserRoleSchema } from '@yayago-app/db/enums';
```

**Commands**:

```bash
npx prisma generate  # Regenerate client + Zod schemas
npx prisma db push   # Push schema changes
npx prisma studio    # Open Prisma Studio
```

### Validators (`packages/validators`)

**Purpose**: Zod schemas for API input/output validation.

**Structure**:

```
packages/validators/src/
├── schemas/
│   ├── __common.schema.ts    # Pagination, shared schemas
│   ├── listing.schema.ts
│   ├── organization.schema.ts
│   ├── subscription-plan.schema.ts
│   ├── user.schema.ts
│   └── ...
└── index.ts                  # Re-exports all schemas
```

**Pattern**:

```typescript
// Input schema (what API receives)
export const CreateListingInputSchema = z.object({
  title: z.string().min(1),
  // ...
});

// Output schema (what API returns)
export const CreateListingOutputSchema = z.object({
  id: z.string(),
  slug: z.string(),
});

// Types
export type CreateListingInputType = z.infer<typeof CreateListingInputSchema>;
export type CreateListingOutputType = z.infer<typeof CreateListingOutputSchema>;
```

**IMPORTANT**: All API schemas MUST be defined here, not in the API package.

### API (`packages/api`)

**Purpose**: ORPC routers and service layer.

**Structure**:

```
packages/api/src/
├── modules/
│   ├── __shared__/
│   │   └── utils.ts          # Pagination, localization helpers
│   ├── listing/
│   │   ├── listing.router.ts
│   │   ├── listing.service.ts
│   │   └── listing.utils.ts
│   ├── organization/
│   ├── subscription-plan/
│   └── ...
├── routers/
│   └── index.ts              # Aggregates all routers
├── context.ts                # Request context type
└── procedures.ts             # Procedure definitions
```

**Router Pattern**:

```typescript
import { procedures } from '../../procedures';
import { CreateListingInputSchema, CreateListingOutputSchema } from '@yayago-app/validators';
import { ListingService } from './listing.service';

export default {
  // Public endpoint
  getPublic: procedures.public
    .input(GetPublicListingInputSchema)
    .output(GetPublicListingOutputSchema)
    .handler(async ({ input, context }) => {
      return await ListingService.getPublic(input, context.locale);
    }),

  // Protected endpoint (requires auth)
  create: procedures.protected
    .input(CreateListingInputSchema)
    .output(CreateListingOutputSchema)
    .handler(async ({ input, context }) => {
      return await ListingService.create(context.session.user.id, input);
    }),

  // Admin-only endpoint
  delete: procedures
    .withRoles('admin', 'moderator')
    .input(DeleteListingInputSchema)
    .output(DeleteListingOutputSchema)
    .handler(async ({ input }) => {
      return await ListingService.delete(input);
    }),
};
```

**Service Pattern**:

```typescript
export class ListingService {
  static async create(userId: string, input: CreateListingInputType): Promise<CreateListingOutputType> {
    // 1. Validate business rules
    // 2. Check permissions/limits
    // 3. Perform database operations
    // 4. Return result matching output schema
  }
}
```

**Procedures Available**:

- `procedures.public` - No auth required
- `procedures.protected` - Requires authenticated user
- `procedures.withRoles('admin', 'moderator')` - Requires specific roles

**IMPORTANT**: Always export routers from `routers/index.ts`:

```typescript
export const appRouter = {
  listings,
  organizations,
  // ... all routers
};
```

### Auth (`packages/auth`)

**Purpose**: Better Auth configuration with Stripe integration.

**Structure**:

```
packages/auth/src/
├── events/
│   ├── on-subscription-complete.ts   # New subscription → create org
│   ├── on-subscription-updated.ts    # Status/plan changes
│   ├── on-subscription-deleted.ts    # Cancellation
│   ├── on-invoice-events.ts          # Payment success/failure
│   └── on-trial-will-end.ts          # Trial ending notification
├── services/
│   ├── sessions/
│   │   └── get-custom-session.ts     # Add org to session
│   └── organization/
│       └── allow-user-to-create-organization.ts
├── emails/
└── index.ts                          # Main auth config
```

**Custom Session Data**:

```typescript
// Session includes:
{
  user: { ... },
  session: { ... },
  organization: {
    id, slug, name, status,
    rejectionReason, banReason
  },
  member: { role }
}
```

### Stripe (`packages/stripe`)

**Purpose**: Stripe client and sync utilities.

**Exports**:

```typescript
import stripe from '@yayago-app/stripe';
import { createStripeProduct, createStripePrice, archiveStripeProduct, archiveStripePrice } from '@yayago-app/stripe';
```

---

## Frontend Patterns

### Form Handling

**CRITICAL**: Always use the `FormInput` component for form fields.

```typescript
// apps/partner/src/components/form-input.tsx

interface FormInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  description?: string;
  render: (field: ControllerRenderProps<T, Path<T>>) => React.ReactNode;
}
```

**Usage**:

```tsx
import FormInput from '@/components/form-input';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Text input
<FormInput
  control={form.control}
  name="title"
  label="Title"
  description="Enter a descriptive title"
  render={(field) => <Input {...field} placeholder="Enter title" />}
/>

// Select input
<FormInput
  control={form.control}
  name="status"
  label="Status"
  render={({ field }) => (
    <Select value={field.value} onValueChange={field.onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select status" />
      </SelectTrigger>
      <SelectContent>
        {StatusSchema.options.map((status) => (
          <SelectItem key={status} value={status}>
            {formatEnumValue(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )}
/>

// Number input
<FormInput
  control={form.control}
  name="price"
  label="Price"
  render={(field) => (
    <Input
      {...field}
      type="number"
      value={field.value || ''}
      onChange={(e) => field.onChange(Number(e.target.value))}
    />
  )}
/>
```

**Form Setup**:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateListingInputSchema, CreateListingInputType } from '@yayago-app/validators';

const form = useForm<CreateListingInputType>({
  resolver: zodResolver(CreateListingInputSchema),
  defaultValues: {
    title: '',
    // Set defaults for all fields
  },
});
```

### Using Enum Options

**DO NOT** define arrays for enum values. Use schema options:

```tsx
// ❌ BAD
const statuses = ['DRAFT', 'AVAILABLE', 'UNAVAILABLE'];

// ✅ GOOD
import { ListingStatusSchema } from '@yayago-app/validators/enums';
// or
import { ListingStatusSchema } from '@yayago-app/db/enums';

// Then use:
{
  ListingStatusSchema.options.map((status) => (
    <SelectItem key={status} value={status}>
      {formatEnumValue(status)}
    </SelectItem>
  ));
}
```

### Data Tables

**Pattern**: Use the data-table components with TanStack Table.

```tsx
// columns.tsx
export const columns: ColumnDef<UserType>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    id: 'actions',
    cell: ({ row }) => <ActionsMenu user={row.original} />,
  },
];

// page.tsx
<DataTable columns={columns} data={users} pagination={pagination} onPageChange={setPage} />;
```

### ORPC Client Usage

```tsx
import { orpc } from '@/utils/orpc';
import { useQuery, useMutation } from '@tanstack/react-query';

// Query
const { data, isLoading } = useQuery(
  orpc.listings.list.queryOptions({
    input: { page: 1, take: 10 },
  })
);

// Mutation
const mutation = useMutation(orpc.listings.create.mutationOptions());

const handleSubmit = async (data: CreateListingInputType) => {
  await mutation.mutateAsync({ input: data });
};
```

### URL Query Parameters

Use `nuqs` for URL state management:

```tsx
import { useQueryState, parseAsInteger } from 'nuqs';

const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
const [search, setSearch] = useQueryState('q');
```

---

## Backend Patterns

### Pagination

```typescript
import { getPagination, paginate } from '../__shared__/utils';

// In service
const { page, take } = input;

const [data, total] = await prisma.$transaction([
  prisma.listing.findMany({
    where,
    ...getPagination({ page, take }),
    orderBy: { createdAt: 'desc' },
  }),
  prisma.listing.count({ where }),
]);

return paginate(data, page, take, total);
```

### Localization

```typescript
import { getLocalizedValue } from '../__shared__/utils';

// In service
const items = data.map((item) => ({
  ...item,
  name: getLocalizedValue(item.name, locale),
  description: getLocalizedValue(item.description, locale),
}));
```

### Slug Generation

```typescript
import { generateSlug } from './listing.utils';

const slug = generateSlug(input.title);
```

### Error Handling

```typescript
import { ORPCError } from '@orpc/client';

// Not found
throw new ORPCError('NOT_FOUND', { message: 'Listing not found' });

// Forbidden
throw new ORPCError('FORBIDDEN', { message: 'You do not have permission' });

// Conflict
throw new ORPCError('CONFLICT', { message: 'Slug already exists' });

// Bad request
throw new ORPCError('BAD_REQUEST', { message: 'Invalid input' });
```

---

## Stripe Integration

### Bidirectional Sync

**App → Stripe** (when admin creates/updates plans):

- Create plan → Creates Stripe product (if not provided)
- Create price → Creates Stripe price (if not provided)
- Update plan → Updates Stripe product
- Delete plan → Archives Stripe product
- Delete price → Archives Stripe price

**Stripe → App** (webhooks):

- `customer.subscription.created` → Create org, snapshot limits
- `customer.subscription.updated` → Update status, handle upgrades
- `customer.subscription.deleted` → Mark as canceled
- `invoice.payment_succeeded` → Restore active status
- `invoice.payment_failed` → Mark as past_due
- `customer.subscription.trial_will_end` → Send notification

### Plan Limits Snapshotting

When a subscription is created or upgraded:

```typescript
await prisma.subscription.update({
  where: { id: subscription.id },
  data: {
    // Snapshot from plan
    maxListings: plan.maxListings,
    maxFeaturedListings: plan.maxFeaturedListings,
    maxMembers: plan.maxMembers,
    maxImagesPerListing: plan.maxImagesPerListing,
    maxVideosPerListing: plan.maxVideosPerListing,
    hasAnalytics: plan.hasAnalytics,
    // Initialize counters
    currentListings: 0,
    currentFeaturedListings: 0,
    currentMembers: 1,
  },
});
```

---

## Build Process

**Order matters!** Build in this sequence:

```bash
# 1. Database (generates Prisma client + Zod schemas)
cd packages/db && npx prisma generate && npm run build

# 2. Validators (depends on db)
cd packages/validators && npm run build

# 3. Stripe (independent)
cd packages/stripe && npm run build

# 4. API (depends on db, validators, stripe)
cd packages/api && npm run build

# 5. Auth (depends on db, stripe)
cd packages/auth && npm run build

# 6. Apps (depend on all packages)
cd apps/admin && npm run build
cd apps/partner && npm run build
cd apps/web && npm run build
```

**After schema changes**:

```bash
cd packages/db
npx prisma generate  # Regenerate types
npm run build        # Rebuild package
# Then rebuild dependent packages
```

---

## MVP Roadmap

### ✅ Phase 0: Foundation (Complete)

- [x] Monorepo setup
- [x] Database schema
- [x] Authentication (Better Auth)
- [x] Admin dashboard base

### ✅ Phase 1: Subscription & Stripe (Complete)

- [x] Subscription plans CRUD
- [x] Stripe product/price sync
- [x] Webhook event handlers
- [x] Plan limits snapshotting

### ✅ Phase 2: Partner Onboarding (Complete)

- [x] Multi-step onboarding form
- [x] Organization status flow
- [x] Status-based route protection
- [x] Context-aware navigation

### ✅ Phase 3: Listing Flow (Complete)

- [x] Fix listing creation UI
- [x] Cloudinary integration for media
- [x] Admin listing verification UI
- [x] Approve/reject listing workflow

### ✅ Phase 4: Public Website (Complete)

- [x] Listings browse page with filters
- [x] Search functionality
- [x] Listing detail page
- [ ] Map integration (deferred)

### 🔲 Phase 5: Booking System

- [ ] Booking data model
- [ ] Availability calendar
- [ ] Booking request flow
- [ ] Payment processing
- [ ] Booking management (user & host)

### 🔲 Phase 6: Polish

- [ ] Email notifications
- [ ] Reviews system
- [ ] Analytics dashboard
- [ ] Mobile apps

---

## Quick Reference

### Common Imports

```typescript
// Database
import prisma from '@yayago-app/db';
import { UserSchema } from '@yayago-app/db/models';
import { UserRoleSchema } from '@yayago-app/db/enums';

// Validators
import { CreateUserInputSchema, CreateUserInputType } from '@yayago-app/validators';

// Stripe
import stripe from '@yayago-app/stripe';
import { createStripeProduct } from '@yayago-app/stripe';

// API (in apps)
import { orpc } from '@/utils/orpc';
```

### File Naming Conventions

- Schemas: `{entity}.schema.ts`
- Services: `{entity}.service.ts`
- Routers: `{entity}.router.ts`
- Components: `{component-name}.tsx` (kebab-case)
- Pages: `page.tsx` (Next.js app router)

### TypeScript Tips

- Always check for linter errors after creating/editing files
- Use `as any` sparingly (only for external library type mismatches)
- Export types alongside schemas in validators
- Use strict typing - avoid `any` in business logic

---

_Last updated: November 2024_
