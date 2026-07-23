import { Request, Response } from "express";
import { listMemberships, updateMembership } from "../services/memberships.service";

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

  try {
    const membership = await updateMembership(parseInt(userId), plan);
    if (!membership) return res.status(404).json({ error: "membership not found" });
    res.json(membership);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
