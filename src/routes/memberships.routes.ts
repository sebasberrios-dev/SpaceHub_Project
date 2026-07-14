import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { list, update } from "../controllers/memberships.controller";

const router = Router();

router.get("/", authenticate, requireAdmin, list);
router.patch("/:userId", authenticate, requireAdmin, update);

export default router;
