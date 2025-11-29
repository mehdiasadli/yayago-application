import { VehicleBrandSchema } from '@yayago-app/db/models';
import { zLocalized } from '@yayago-app/i18n';
import { z } from 'zod';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';

export const CreateVehicleBrandInputSchema = VehicleBrandSchema.pick({
  website: true,
  originCountryCode: true,
  logo: true,
}).extend({
  name: zLocalized(),
  description: zLocalized().optional(),
  title: zLocalized().optional(),
  keywords: zLocalized().optional(),
});

export const CreateVehicleBrandOutputSchema = VehicleBrandSchema.pick({
  slug: true,
}).extend({
  name: z.string(),
});

export type CreateVehicleBrandInputType = z.infer<typeof CreateVehicleBrandInputSchema>;
export type CreateVehicleBrandOutputType = z.infer<typeof CreateVehicleBrandOutputSchema>;

export const FindOneVehicleBrandInputSchema = VehicleBrandSchema.pick({
  slug: true,
});

export const FindOneVehicleBrandOutputSchema = VehicleBrandSchema.pick({
  slug: true,
  logo: true,
  website: true,
  originCountryCode: true,
}).extend({
  name: z.string(),
  description: z.string().optional(),
  title: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export type FindOneVehicleBrandInputType = z.infer<typeof FindOneVehicleBrandInputSchema>;
export type FindOneVehicleBrandOutputType = z.infer<typeof FindOneVehicleBrandOutputSchema>;

export const ListVehicleBrandInputSchema = z
  .object({
    q: z.string().optional(),
    originCountryCode: z.string().length(2).optional(),
  })
  .extend(PaginationInputSchema.shape);

export const ListVehicleBrandOutputSchema = PaginationOutputSchema(
  VehicleBrandSchema.pick({
    slug: true,
    logo: true,
    website: true,
    originCountryCode: true,
  }).extend({
    name: z.string(),
  })
);

export type ListVehicleBrandInputType = z.infer<typeof ListVehicleBrandInputSchema>;
export type ListVehicleBrandOutputType = z.infer<typeof ListVehicleBrandOutputSchema>;

export const UpdateVehicleBrandInputSchema = z.object({
  slug: VehicleBrandSchema.shape.slug,
  data: CreateVehicleBrandInputSchema.partial(),
});

export const UpdateVehicleBrandOutputSchema = VehicleBrandSchema.pick({
  slug: true,
}).extend({
  name: z.string(),
});

export type UpdateVehicleBrandInputType = z.infer<typeof UpdateVehicleBrandInputSchema>;
export type UpdateVehicleBrandOutputType = z.infer<typeof UpdateVehicleBrandOutputSchema>;

export const DeleteVehicleBrandInputSchema = VehicleBrandSchema.pick({
  slug: true,
});
export const DeleteVehicleBrandOutputSchema = VehicleBrandSchema.pick({
  slug: true,
});

export type DeleteVehicleBrandInputType = z.infer<typeof DeleteVehicleBrandInputSchema>;
export type DeleteVehicleBrandOutputType = z.infer<typeof DeleteVehicleBrandOutputSchema>;
