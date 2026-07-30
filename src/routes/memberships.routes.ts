import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { list, update } from "../controllers/memberships.controller";
import { validate } from "../middleware/validate";
import { updateMembershipSchema } from "../validators/memberships.validators";

const router = Router();

router.get("/", authenticate, requireAdmin, list);
router.patch("/:userId", authenticate, requireAdmin, validate(updateMembershipSchema), update);

export default router;
