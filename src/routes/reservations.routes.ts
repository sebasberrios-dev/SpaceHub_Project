import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate, onlyMember } from "../middleware/auth.middleware";

const router = Router();

router.post("/", authenticate, onlyMember, async (req, res) => {
  const { spaceId, startTime, endTime } = req.body;
  const userId = req.user.userId;

  const start = new Date(startTime);
  const end = new Date(endTime);

  try {
    const space = await prisma.space.findUnique({
      where: { id: parseInt(spaceId) },
    });

    if (!space || !space.isActive) {
      return res.status(404).json({ error: "Space not found or inactive" });
    }

    const conflict = await prisma.booking.findFirst({
      where: {
        spaceId: parseInt(spaceId),
        status: { not: "canceled" },
        AND: [{ startTime: { lt: end } }, { endTime: { gt: start } }],
      },
    });

    if (conflict) {
      return res
        .status(409)
        .json({ error: "The space is not available at that time" });
    }

    const durationMs = end.getTime() - start.getTime();
    const durationHours = durationMs / (1000 * 60 * 60);
    const totalPrice = parseFloat(
      (durationHours * space.pricePerHour).toFixed(2),
    );

    const booking = await prisma.booking.create({
      data: {
        userId,
        spaceId: parseInt(spaceId),
        startTime: start,
        endTime: end,
        status: "confirmed",
        totalPrice,
      },
    });

    res.status(201).json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", authenticate, async (req, res) => {
  try {
    const where = req.user.role === "admin" ? {} : { userId: req.user.userId };
    const bookings = await prisma.booking.findMany({
      where,
      include: { user: true, space: true },
    });
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
      include: { user: true, space: true },
    });

    if (!booking) {
      return res.status(404).json({ error: "booking not found" });
    }

    if (req.user.role !== "admin" && booking.userId !== req.user.userId) {
      return res.status(403).json({ error: "access denied" });
    }

    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:id/cancel", authenticate, async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: parseInt(id) },
    });

    if (!booking) {
      return res.status(404).json({ error: "booking not found" });
    }

    if (req.user.role !== "admin" && booking.userId !== req.user.userId) {
      return res.status(403).json({ error: "access denied" });
    }

    const updated = await prisma.booking.update({
      where: { id: parseInt(id) },
      data: { status: "canceled" },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(404).json({ error: "booking not found" });
  }
});

export default router;
