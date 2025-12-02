import { PlaceStatusSchema } from '@yayago-app/db/enums';
import { CountrySchema } from '@yayago-app/db/models';
import { zLocalized } from '@yayago-app/i18n';
import z from 'zod';
import { PaginationOutputSchema } from './__common.schema';

export const CreateCountryInputSchema = CountrySchema.pick({
  code: true,
  currency: true,
  emergencyPhoneNumber: true,
  phoneCode: true,
  trafficDirection: true,
  flag: true,
  minDriverAge: true,
  minDriverLicenseAge: true,
  platformCommissionRate: true,
}).extend({
  name: zLocalized(),
  title: zLocalized().optional(),
  description: zLocalized().optional(),
  platformCommissionRate: z.number().min(0).max(1).default(0.05).optional(), // 0 to 100% as decimal
});

export const CreateCountryOutputSchema = CountrySchema.pick({
  code: true,
}).extend({
  name: z.string(),
});

export type CreateCountryInputType = z.infer<typeof CreateCountryInputSchema>;
export type CreateCountryOutputType = z.infer<typeof CreateCountryOutputSchema>;

export const FindOneCountryInputSchema = CountrySchema.pick({
  code: true,
});

export const FindOneCountryOutputSchema = CountrySchema.pick({
  code: true,
  createdAt: true,
  updatedAt: true,
  currency: true,
  description: true,
  emergencyPhoneNumber: true,
  flag: true,
  minDriverAge: true,
  minDriverLicenseAge: true,
  name: true,
  phoneCode: true,
  status: true,
  title: true,
  trafficDirection: true,
  platformCommissionRate: true,
});

export type FindOneCountryInputType = z.infer<typeof FindOneCountryInputSchema>;
export type FindOneCountryOutputType = z.infer<typeof FindOneCountryOutputSchema>;

export const ListCountriesInputSchema = z.object({
  // search
  q: z.string().optional(),
  // pagination
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(100).default(10),
  // filters
  status: PlaceStatusSchema.optional(),
});

export const ListCountriesOutputSchema = PaginationOutputSchema(
  CountrySchema.pick({
    code: true,
    createdAt: true,
    currency: true,
    flag: true,
    status: true,
  }).extend({
    name: z.string(),
  })
);

export type ListCountriesInputType = z.infer<typeof ListCountriesInputSchema>;
export type ListCountriesOutputType = z.infer<typeof ListCountriesOutputSchema>;

export const UpdateCountryStatusInputSchema = z.object({
  code: CountrySchema.shape.code,
  status: PlaceStatusSchema,
});

export const UpdateCountryStatusOutputSchema = CountrySchema.pick({
  status: true,
});

export type UpdateCountryStatusInputType = z.infer<typeof UpdateCountryStatusInputSchema>;
export type UpdateCountryStatusOutputType = z.infer<typeof UpdateCountryStatusOutputSchema>;

export const UpdateCountryInputSchema = CountrySchema.pick({
  code: true,
  currency: true,
  description: true,
  emergencyPhoneNumber: true,
  flag: true,
  minDriverAge: true,
  minDriverLicenseAge: true,
  name: true,
  phoneCode: true,
  status: true,
  title: true,
  trafficDirection: true,
  platformCommissionRate: true,
});

export const UpdateCountryOutputSchema = CountrySchema.pick({
  code: true,
});

export type UpdateCountryInputType = z.infer<typeof UpdateCountryInputSchema>;
export type UpdateCountryOutputType = z.infer<typeof UpdateCountryOutputSchema>;

export const DeleteCountryInputSchema = z.object({
  code: CountrySchema.shape.code,
});

export type DeleteCountryInputType = z.infer<typeof DeleteCountryInputSchema>;
