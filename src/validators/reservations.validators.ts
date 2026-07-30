import { z } from "zod";

export const createReservationSchema = z.object({
  spaceId: z.number().int().positive("spaceId must be a positive integer"),
  startTime: z.string().min(1, "startTime is required"),
  endTime: z.string().min(1, "endTime is required"),
});
