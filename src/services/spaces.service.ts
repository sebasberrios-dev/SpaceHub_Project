import { SpaceType } from "@prisma/client";
import prisma from "../lib/prisma";
import { buildOverlapFilter } from "../lib/booking.utils";

export async function listSpaces(type?: string, minCapacity?: string, date?: string) {
  const filters: any = {};
  if (type) filters.type = type;
  if (minCapacity) filters.capacity = { gte: parseInt(minCapacity) };
  if (date) {
    const dayStart = new Date(date);
    const dayEnd = new Date(date);
    dayEnd.setDate(dayEnd.getDate() + 1);
    filters.bookings = {
      none: {
        status: { not: "canceled" },
        ...buildOverlapFilter(dayStart, dayEnd),
      },
    };
  }
  return prisma.space.findMany({ where: { ...filters, isActive: true } });
}

export async function getSpaceById(id: number) {
  return prisma.space.findFirst({ where: { id, isActive: true } });
}

export async function createSpace(data: {
  name: string;
  type: string;
  capacity: number;
  pricePerHour: number;
  location: string;
}) {
  return prisma.space.create({
    data: { ...data, type: data.type as SpaceType, isActive: true },
  });
}

export async function updateSpace(
  id: number,
  data: {
    name?: string;
    type?: string;
    capacity?: number;
    pricePerHour?: number;
    location?: string;
  },
) {
  const space = await prisma.space.findUnique({ where: { id } });
  if (!space) return null;
  return prisma.space.update({
    where: { id },
    data: { ...data, type: data.type as SpaceType | undefined },
  });
}

export async function deactivateSpace(id: number) {
  const space = await prisma.space.findUnique({ where: { id } });
  if (!space) return null;
  return prisma.space.update({ where: { id }, data: { isActive: false } });
}
