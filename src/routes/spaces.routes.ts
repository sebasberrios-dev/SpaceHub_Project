import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", async (req, res) => {
  const { type, minCapacity, date } = req.query;

  const filters: any = {};

  if (type) {
    filters.type = type as string;
  }

  if (minCapacity) {
    filters.capacity = { gte: parseInt(minCapacity as string) };
  }

  if (date) {
    const dayStart = new Date(date as string);
    const dayEnd = new Date(date as string);
    dayEnd.setDate(dayEnd.getDate() + 1);

    filters.bookings = {
      none: {
        status: { not: "canceled" },
        AND: [{ startTime: { lt: dayEnd } }, { endTime: { gt: dayStart } }],
      },
    };
  }

  try {
    const spaces = await prisma.space.findMany({
      where: { ...filters, isActive: true },
    });
    res.json(spaces);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const space = await prisma.space.findUnique({
      where: { id: parseInt(id) },
    });

    if (!space) {
      return res.status(404).json({ error: "Space not found" });
    }

    res.json(space);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", authenticate, requireAdmin, async (req, res) => {
  const { name, type, capacity, pricePerHour, location } = req.body;

  try {
    const space = await prisma.space.create({
      data: { name, type, capacity, pricePerHour, location, isActive: true },
    });
    res.status(201).json(space);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, type, capacity, pricePerHour, location } = req.body;

  try {
    const space = await prisma.space.findUnique({
      where: { id: parseInt(id) },
    });

    if (!space) {
      return res.status(404).json({ error: "space not found" });
    }

    const updated = await prisma.space.update({
      where: { id: parseInt(id) },
      data: { name, type, capacity, pricePerHour, location },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:id", authenticate, requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const space = await prisma.space.findUnique({
      where: { id: parseInt(id) },
    });

    if (!space) {
      return res.status(404).json({ error: "space not found" });
    }

    const updated = await prisma.space.update({
      where: { id: parseInt(id) },
      data: { isActive: false },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
