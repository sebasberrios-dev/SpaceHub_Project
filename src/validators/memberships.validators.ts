import { z } from "zod";

const VALID_PLANS = ["basic", "pro", "enterprise"] as const;

export const updateMembershipSchema = z.object({
  plan: z
    .string()
    .refine((val) => VALID_PLANS.includes(val as (typeof VALID_PLANS)[number]), {
      message: "Invalid plan. Must be basic, pro or enterprise",
    }),
});
