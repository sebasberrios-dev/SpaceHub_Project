import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { create, list, getById, cancel } from "../controllers/reservations.controller";
import { validate } from "../middleware/validate";
import { createReservationSchema } from "../validators/reservations.validators";

const router = Router();

router.post("/", authenticate, validate(createReservationSchema), create);
router.get("/", authenticate, list);
router.get("/:id", authenticate, getById);
router.patch("/:id/cancel", authenticate, cancel);

export default router;
