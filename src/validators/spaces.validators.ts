import { z } from "zod";

const spaceTypeEnum = z.enum(["individual_desk", "private_room", "business_suite"]);

export const createSpaceSchema = z.object({
  name: z.string().min(1, "name is required"),
  type: spaceTypeEnum.describe("type must be individual_desk, private_room or business_suite"),
  capacity: z.number().int().positive("capacity must be greater than 0"),
  pricePerHour: z.number().positive("pricePerHour must be greater than 0"),
  location: z.string().min(1, "location is required"),
});

export const updateSpaceSchema = z.object({
  name: z.string().min(1, "name cannot be empty").optional(),
  type: spaceTypeEnum.optional(),
  capacity: z.number().int().positive("capacity must be greater than 0").optional(),
  pricePerHour: z.number().positive("pricePerHour must be greater than 0").optional(),
  location: z.string().optional(),
});
