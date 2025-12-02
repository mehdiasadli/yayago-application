import z from 'zod';

export const DecodeVinInputSchema = z.object({
  vin: z.string().length(17),
});

export const DecodeVinOutputSchema = z.discriminatedUnion('vinValid', [
  z.object({
    vin: z.string(),
    vinValid: z.literal(true),
    origin: z.string(), // e.g. Germany
    type: z.string(), // e.g. Passenger Car
    make: z.string(), // Porsche
    model: z.string(), // 911
    trim: z.string(), // GT3 RS
    style: z.string(), // 2dr Coupe
    vehicle: z.object({
      vin: z.string(),
      year: z.number().int(), // e.g. 2021
      make: z.string(), // Porsche
      model: z.string(), // 911
      manufacturer: z.string(), // Dr Ing HCF Porsh Ag
    }),
  }),
  z.object({
    vin: z.string(),
    vinValid: z.literal(false),
    error: z.object({
      error: z.string(),
      code: z.string(),
    }),
  }),
]);
