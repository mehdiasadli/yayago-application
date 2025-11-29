import * as z from 'zod';

export const InsuranceTypeSchema = z.enum(['BASIC', 'STANDARD', 'COMPREHENSIVE', 'PREMIUM'])

export type InsuranceType = z.infer<typeof InsuranceTypeSchema>;