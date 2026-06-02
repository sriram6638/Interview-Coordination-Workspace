import { z } from 'zod';

export const createSlotSchema = z.object({
  interviewId: z.string().nonempty(),
  interviewerId: z.string().nonempty(),
  startTime: z.string().nonempty(),
  endTime: z.string().nonempty(),
});

export const updateSlotSchema = z.object({
  slotId: z.string().nonempty(),
  action: z.enum(['book', 'cancel']),
});
