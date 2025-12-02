import z from 'zod';

export const DecodeVinInputSchema = z.object({
  vin: z.string().length(17, 'VIN must be exactly 17 characters'),
});

export type DecodeVinInputType = z.infer<typeof DecodeVinInputSchema>;

// Raw API response schema (internal use)
export const AutoDevApiResponseSchema = z.discriminatedUnion('vinValid', [
  z.object({
    vin: z.string(),
    vinValid: z.literal(true),
    origin: z.string().optional(), // e.g. Germany
    type: z.string().optional(), // e.g. Passenger Car
    make: z.string(), // Porsche
    model: z.string(), // 911
    trim: z.string().optional(), // GT3 RS
    style: z.string().optional(), // 2dr Coupe
    vehicle: z.object({
      vin: z.string(),
      year: z.number().int(), // e.g. 2021
      make: z.string(), // Porsche
      model: z.string(), // 911
      manufacturer: z.string().optional(), // Dr Ing HCF Porsh Ag
    }),
  }),
  z.object({
    vin: z.string().optional(),
    vinValid: z.literal(false),
    status: z.number().optional(),
    error: z.string(),
    code: z.string(),
  }),
]);

export type AutoDevApiResponseType = z.infer<typeof AutoDevApiResponseSchema>;

// Output schema with matched database IDs
export const DecodeVinOutputSchema = z.discriminatedUnion('vinValid', [
  z.object({
    vinValid: z.literal(true),
    vin: z.string(),
    make: z.string(), // Raw from API
    model: z.string(), // Raw from API
    year: z.number().int(),
    trim: z.string().nullable(),
    style: z.string().nullable(),
    manufacturer: z.string().nullable(),
    // Matched database records (null if no match found)
    matchedBrandId: z.string().nullable(),
    matchedBrandName: z.string().nullable(), // Localized name for display
    matchedModelId: z.string().nullable(),
    matchedModelName: z.string().nullable(), // Localized name for display
  }),
  z.object({
    vinValid: z.literal(false),
    vin: z.string(),
    error: z.string(),
    code: z.string(),
  }),
]);

export type DecodeVinOutputType = z.infer<typeof DecodeVinOutputSchema>;
