import { Router } from "express";
import prisma from "../lib/prisma";
import { authenticate, requireAdmin } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, requireAdmin, async (req, res) => {
  try {
    const memberships = await prisma.membership.findMany({
      where: {
        endDate: { gt: new Date() },
      },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });
    res.json(memberships);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch("/:userId", authenticate, requireAdmin, async (req, res) => {
  const { userId } = req.params;
  const { plan } = req.body;
  const VALID_PLANS = ["basic", "pro", "enterprise"] as const;
  type Plan = (typeof VALID_PLANS)[number];

  if (!VALID_PLANS.includes(plan as Plan)) {
    return res
      .status(400)
      .json({ error: "Invalid plan. Must be basic, pro or enterprise" });
  }
  try {
    const membership = await prisma.membership.findUnique({
      where: { userId: parseInt(userId) },
    });

    if (!membership) {
      return res.status(404).json({ error: "membership not found" });
    }

    const updated = await prisma.membership.update({
      where: { userId: parseInt(userId) },
      data: { plan },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
