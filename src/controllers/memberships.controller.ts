import { Request, Response } from "express";
import { listMemberships, updateMembership } from "../services/memberships.service";

const VALID_PLANS = ["basic", "pro", "enterprise"] as const;
type Plan = (typeof VALID_PLANS)[number];

export async function list(req: Request, res: Response) {
  try {
    const memberships = await listMemberships();
    res.json(memberships);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function update(req: Request, res: Response) {
  const { userId } = req.params;
  const { plan } = req.body;

  if (!VALID_PLANS.includes(plan as Plan))
    return res
      .status(400)
      .json({ error: "Invalid plan. Must be basic, pro or enterprise" });

  try {
    const membership = await updateMembership(parseInt(userId), plan);
    if (!membership) return res.status(404).json({ error: "membership not found" });
    res.json(membership);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
