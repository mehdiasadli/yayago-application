import z from 'zod';

export const DecodeVinInputSchema = z.object({
  vin: z.string().length(17, 'VIN must be exactly 17 characters'),
});

export type DecodeVinInputType = z.infer<typeof DecodeVinInputSchema>;

// Raw API response schema (internal use)
// Many fields can be undefined depending on the VIN and API response
export const AutoDevApiResponseSchema = z.discriminatedUnion('vinValid', [
  z.object({
    vin: z.string(),
    vinValid: z.literal(true),
    origin: z.string().optional(), // e.g. Germany
    type: z.string().optional(), // e.g. Passenger Car
    make: z.string().optional(), // Porsche - can be undefined
    model: z.string().optional(), // 911 - can be undefined
    trim: z.string().optional(), // GT3 RS
    style: z.string().optional(), // 2dr Coupe
    vehicle: z
      .object({
        vin: z.string().optional(),
        year: z.union([z.number().int(), z.array(z.number().int())]).optional(), // e.g. 2021 or [2019, 2020]
        make: z.string().optional(), // Porsche
        model: z.string().optional(), // 911
        manufacturer: z.string().optional(), // Dr Ing HCF Porsh Ag
      })
      .optional(),
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
    make: z.string().nullable(), // Raw from API - can be null if not found
    model: z.string().nullable(), // Raw from API - can be null if not found
    year: z.number().int().nullable(), // Default/first year - can be null if not found
    years: z.array(z.number().int()).optional(), // All possible years (if multiple)
    trim: z.string().nullable(),
    style: z.string().nullable(),
    manufacturer: z.string().nullable(),
    // Matched database records (null if no match found)
    matchedBrandId: z.string().nullable(),
    matchedBrandName: z.string().nullable(), // Localized name for display
    matchedModelId: z.string().nullable(),
    matchedModelName: z.string().nullable(), // Localized name for display
    // Flag indicating incomplete data requiring manual entry
    requiresManualEntry: z.boolean().optional(),
  }),
  z.object({
    vinValid: z.literal(false),
    vin: z.string(),
    error: z.string(),
    code: z.string(),
  }),
]);

export type DecodeVinOutputType = z.infer<typeof DecodeVinOutputSchema>;
