import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { list, getById, create, update, deactivate } from "../controllers/spaces.controller";
import { validate } from "../middleware/validate";
import { createSpaceSchema, updateSpaceSchema } from "../validators/spaces.validators";

const router = Router();

router.get("/", list);
router.get("/:id", getById);
router.post("/", authenticate, requireAdmin, validate(createSpaceSchema), create);
router.put("/:id", authenticate, requireAdmin, validate(updateSpaceSchema), update);
router.delete("/:id", authenticate, requireAdmin, deactivate);

export default router;
