import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { create, list, getById, cancel } from "../controllers/reservations.controller";

const router = Router();

router.post("/", authenticate, create);
router.get("/", authenticate, list);
router.get("/:id", authenticate, getById);
router.patch("/:id/cancel", authenticate, cancel);

export default router;
