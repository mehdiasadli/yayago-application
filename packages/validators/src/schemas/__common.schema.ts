import z from 'zod';

export const PaginationInputSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(100).default(25),
});

export const PaginationOutputSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    items: z.array(schema),
    pagination: PaginationInputSchema.extend({
      total: z.coerce.number().int().min(0).default(0),
      totalPages: z.coerce.number().int().min(0).default(0),
    }),
  });
