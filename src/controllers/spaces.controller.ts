import { Request, Response } from "express";
import {
  listSpaces,
  getSpaceById,
  createSpace,
  updateSpace,
  deactivateSpace,
} from "../services/spaces.service";

const VALID_TYPES = ["individual_desk", "private_room", "business_suite"];

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

  if (!name || name.trim().length === 0)
    return res.status(400).json({ error: "name is required" });
  if (!type || !VALID_TYPES.includes(type))
    return res.status(400).json({
      error: "type must be individual_desk, private_room or business_suite",
    });
  if (!capacity || capacity <= 0)
    return res.status(400).json({ error: "capacity must be greater than 0" });
  if (!pricePerHour || pricePerHour <= 0)
    return res.status(400).json({ error: "priceHour must be greater than 0" });

  try {
    const space = await createSpace({ name, type, capacity, pricePerHour, location });
    res.status(201).json(space);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function update(req: Request, res: Response) {
  const { name, type, capacity, pricePerHour, location } = req.body;

  if (name !== undefined && name.trim().length === 0)
    return res.status(400).json({ error: "name cannot be empty" });
  if (type !== undefined && !VALID_TYPES.includes(type))
    return res.status(400).json({
      error: "type must be individual_desk, private_room, or business_suite",
    });
  if (capacity !== undefined && capacity <= 0)
    return res.status(400).json({ error: "capacity must be greater than 0" });
  if (pricePerHour !== undefined && pricePerHour <= 0)
    return res.status(400).json({ error: "pricePerHour must be greater than 0" });

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
