import { Request, Response } from "express";
import {
  createReservation,
  listReservations,
  getReservationById,
  cancelReservation,
} from "../services/reservations.service";

export async function create(req: Request, res: Response) {
  const { spaceId, startTime, endTime } = req.body;
  const userId = req.user!.userId;
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (end <= start)
    return res.status(400).json({ error: "endTime must be after startTime" });
  if (start <= new Date())
    return res.status(400).json({ error: "startTime must be in the future" });

  try {
    const result = await createReservation(userId, parseInt(spaceId), start, end);
    if ("error" in result) {
      if (result.error === "notFound")
        return res.status(404).json({ error: "Space not found or inactive" });
      return res.status(409).json({ error: "The space is not available at that time" });
    }
    res.status(201).json(result.booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function list(req: Request, res: Response) {
  try {
    const bookings = await listReservations(req.user!.role, req.user!.userId);
    res.json(bookings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function getById(req: Request, res: Response) {
  try {
    const booking = await getReservationById(parseInt(req.params.id));
    if (!booking) return res.status(404).json({ error: "booking not found" });
    if (req.user!.role !== "admin" && booking.userId !== req.user!.userId)
      return res.status(403).json({ error: "access denied" });
    res.json(booking);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

export async function cancel(req: Request, res: Response) {
  const id = parseInt(req.params.id);
  try {
    const booking = await getReservationById(id);
    if (!booking) return res.status(404).json({ error: "booking not found" });
    if (req.user!.role !== "admin" && booking.userId !== req.user!.userId)
      return res.status(403).json({ error: "access denied" });
    const updated = await cancelReservation(
      id,
      booking.spaceId,
      booking.startTime,
      booking.endTime,
    );
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
