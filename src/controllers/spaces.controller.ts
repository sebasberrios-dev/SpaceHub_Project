import { Request, Response } from "express";
import {
  listSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deactivateSpace,
} from "../services/spaces.service";

export async function list(req: Request, res: Response) {
  try {
    const { type, minCapacity, date } = req.query;
    const spaces = await listSpaces(
      type as string,
      minCapacity as string,
      date as string,
    );
    res.json(spaces);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const space = await getSpaceById(parseInt(req.params.id));
    if (!space) return res.status(404).json({ error: "Space not found" });
    res.json(space);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function create(req: Request, res: Response) {
  const { name, type, capacity, pricePerHour, location } = req.body;

  try {
    const space = await createSpace({ name, type, capacity, pricePerHour, location });
    res.status(201).json(space);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function update(req: Request, res: Response) {
  const { name, type, capacity, pricePerHour, location } = req.body;

  try {
    const space = await updateSpace(parseInt(req.params.id), {
      name,
      type,
      capacity,
      pricePerHour,
      location,
    });
    if (!space) return res.status(404).json({ error: "space not found" });
    res.json(space);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function deactivate(req: Request, res: Response) {
  try {
    const space = await deactivateSpace(parseInt(req.params.id));
    if (!space) return res.status(404).json({ error: "space not found" });
    res.json(space);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
