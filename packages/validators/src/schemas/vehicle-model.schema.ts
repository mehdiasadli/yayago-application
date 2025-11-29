import { VehicleBrandSchema, VehicleModelSchema } from '@yayago-app/db/models';
import { zLocalized } from '@yayago-app/i18n';
import { z } from 'zod';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';

export const CreateVehicleModelInputSchema = VehicleModelSchema.pick({}).extend({
  brandSlug: z.string(),
  name: zLocalized(),
  description: zLocalized().optional(),
  title: zLocalized().optional(),
  keywords: zLocalized().optional(),
});

export const CreateVehicleModelOutputSchema = VehicleModelSchema.pick({
  slug: true,
}).extend({
  name: z.string(),
});

export type CreateVehicleModelInputType = z.infer<typeof CreateVehicleModelInputSchema>;
export type CreateVehicleModelOutputType = z.infer<typeof CreateVehicleModelOutputSchema>;

export const FindOneVehicleModelInputSchema = VehicleModelSchema.pick({
  slug: true,
});

export const FindOneVehicleModelOutputSchema = VehicleModelSchema.pick({
  slug: true,
}).extend({
  name: z.string(),
  description: z.string().optional(),
  title: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  brand: VehicleBrandSchema.pick({
    slug: true,
    logo: true,
    originCountryCode: true,
  }).extend({
    name: z.string(),
  }),
});

export type FindOneVehicleModelInputType = z.infer<typeof FindOneVehicleModelInputSchema>;
export type FindOneVehicleModelOutputType = z.infer<typeof FindOneVehicleModelOutputSchema>;

export const ListVehicleModelInputSchema = z
  .object({
    q: z.string().optional(),
    originCountryCode: z.string().length(2).optional(),
    brandSlug: z.string().optional(),
  })
  .extend(PaginationInputSchema.shape);

export const ListVehicleModelOutputSchema = PaginationOutputSchema(
  VehicleModelSchema.pick({
    id: true,
    slug: true,
  }).extend({
    name: z.string(),
    brand: VehicleBrandSchema.pick({
      slug: true,
      logo: true,
      originCountryCode: true,
    }).extend({
      name: z.string(),
    }),
  })
);

export type ListVehicleModelInputType = z.infer<typeof ListVehicleModelInputSchema>;
export type ListVehicleModelOutputType = z.infer<typeof ListVehicleModelOutputSchema>;

export const UpdateVehicleModelInputSchema = z.object({
  slug: z.string(),
  name: zLocalized().optional(),
  description: zLocalized().optional(),
  title: zLocalized().optional(),
  keywords: zLocalized().optional(),
});
export const UpdateVehicleModelOutputSchema = CreateVehicleModelOutputSchema;

export type UpdateVehicleModelInputType = z.infer<typeof UpdateVehicleModelInputSchema>;
export type UpdateVehicleModelOutputType = z.infer<typeof UpdateVehicleModelOutputSchema>;

export const DeleteVehicleModelInputSchema = VehicleModelSchema.pick({
  slug: true,
});
export const DeleteVehicleModelOutputSchema = VehicleModelSchema.pick({
  slug: true,
});

export type DeleteVehicleModelInputType = z.infer<typeof DeleteVehicleModelInputSchema>;
export type DeleteVehicleModelOutputType = z.infer<typeof DeleteVehicleModelOutputSchema>;
