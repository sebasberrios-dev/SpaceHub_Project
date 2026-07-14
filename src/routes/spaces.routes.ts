import { Router } from "express";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";
import { list, getById, create, update, deactivate } from "../controllers/spaces.controller";

const router = Router();

router.get("/", list);
router.get("/:id", getById);
router.post("/", authenticate, requireAdmin, create);
router.put("/:id", authenticate, requireAdmin, update);
router.delete("/:id", authenticate, requireAdmin, deactivate);

export default router;
