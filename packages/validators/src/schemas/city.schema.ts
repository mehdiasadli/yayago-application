import { CitySchema, CountryDocumentRequirementSchema, CountrySchema } from '@yayago-app/db/models';
import z from 'zod';
import { PaginationInputSchema, PaginationOutputSchema } from './__common.schema';
import { zLocalized } from '@yayago-app/i18n';
import { PlaceStatusSchema } from '@yayago-app/db/enums';

export const CreateCityInputSchema = CitySchema.pick({
  code: true,
  googleMapsPlaceId: true,
  isDefaultOfCounry: true,
  lat: true,
  lng: true,
  timezone: true,
}).extend({
  countryCode: CountrySchema.shape.code,
  name: zLocalized(),
  title: zLocalized().optional(),
  description: zLocalized().optional(),
});

export const CreateCityOutputSchema = CitySchema.pick({
  id: true,
  slug: true,
  code: true,
}).extend({
  name: z.string(),
});

export type CreateCityInputType = z.infer<typeof CreateCityInputSchema>;
export type CreateCityOutputType = z.infer<typeof CreateCityOutputSchema>;

export const ListCityInputSchema = CitySchema.pick({})
  .extend({
    status: PlaceStatusSchema.optional(),
    q: z.string().optional(),
    countryCode: CountrySchema.shape.code.optional(),
  })
  .extend(PaginationInputSchema.shape);

export const ListCityOutputSchema = PaginationOutputSchema(
  CitySchema.pick({
    id: true,
    code: true,
    slug: true,
    status: true,
    lat: true,
    lng: true,
    timezone: true,
    createdAt: true,
  }).extend({
    name: z.string(),
    country: CountrySchema.pick({
      code: true,
      status: true,
    }).extend({
      name: z.string(),
    }),
  })
);

export type ListCityInputType = z.infer<typeof ListCityInputSchema>;
export type ListCityOutputType = z.infer<typeof ListCityOutputSchema>;

export const FindOneCityInputSchema = CitySchema.pick({
  code: true,
});

export const FindOneCityOutputSchema = CitySchema.pick({
  code: true,
  slug: true,
  status: true,
  lat: true,
  lng: true,
  timezone: true,
  createdAt: true,
  updatedAt: true,
  heroImageUrl: true,
  googleMapsPlaceId: true,
  isDefaultOfCounry: true,
}).extend({
  name: z.string(),
  description: z.string().optional(),
  title: z.string().optional(),
  heroImageAlt: z.string().optional(),
  country: CountrySchema.pick({
    code: true,
    status: true,
  }).extend({
    name: z.string(),
  }),
});

export type FindOneCityInputType = z.infer<typeof FindOneCityInputSchema>;
export type FindOneCityOutputType = z.infer<typeof FindOneCityOutputSchema>;

export const UpdateCityStatusInputSchema = CitySchema.pick({
  status: true,
}).extend({
  code: CitySchema.shape.code,
});

export const UpdateCityStatusOutputSchema = CitySchema.pick({
  status: true,
});

export type UpdateCityStatusInputType = z.infer<typeof UpdateCityStatusInputSchema>;
export type UpdateCityStatusOutputType = z.infer<typeof UpdateCityStatusOutputSchema>;

export const UpdateCityInputSchema = CitySchema.pick({
  code: true,
  slug: true,
  status: true,
  lat: true,
  lng: true,
  timezone: true,
  createdAt: true,
  updatedAt: true,
  heroImageUrl: true,
  googleMapsPlaceId: true,
  isDefaultOfCounry: true,
});

export const UpdateCityOutputSchema = CitySchema.pick({
  code: true,
}).extend({
  countryCode: CountrySchema.shape.code,
});

export type UpdateCityInputType = z.infer<typeof UpdateCityInputSchema>;
export type UpdateCityOutputType = z.infer<typeof UpdateCityOutputSchema>;

export const DeleteCityInputSchema = CitySchema.pick({
  code: true,
});

export const DeleteCityOutputSchema = CitySchema.pick({
  code: true,
});

export type DeleteCityInputType = z.infer<typeof DeleteCityInputSchema>;
export type DeleteCityOutputType = z.infer<typeof DeleteCityOutputSchema>;

export const FindCitiesForOnboardingInputSchema = z.object({
  q: z.string().optional(),
});

export const FindCitiesForOnboardingOutputSchema = CitySchema.pick({
  code: true,
  googleMapsPlaceId: true,
  lat: true,
  lng: true,
})
  .extend({
    name: z.string(),
    country: CountrySchema.pick({
      code: true,
    }).extend({
      name: z.string(),
      requiredDocuments: CountryDocumentRequirementSchema.pick({
        isRequired: true,
      })
        .extend({
          label: z.string(),
          description: z.string(),
        })
        .array(),
    }),
  })
  .array();

export type FindCitiesForOnboardingInputType = z.infer<typeof FindCitiesForOnboardingInputSchema>;
export type FindCitiesForOnboardingOutputType = z.infer<typeof FindCitiesForOnboardingOutputSchema>;
