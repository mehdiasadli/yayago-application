import * as z from 'zod';

export const TrafficDirectionSchema = z.enum(['LEFT', 'RIGHT', 'HYBRID'])

export type TrafficDirection = z.infer<typeof TrafficDirectionSchema>;