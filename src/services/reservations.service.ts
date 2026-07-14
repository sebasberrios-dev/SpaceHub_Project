import prisma from "../lib/prisma";
import { pubsub, BOOKING_CREATED } from "../graphql/pubsub";
import { buildOverlapFilter } from "../lib/booking.utils";

export async function createReservation(
  userId: number,
  spaceId: number,
  start: Date,
  end: Date,
) {
  const space = await prisma.space.findUnique({ where: { id: spaceId } });
  if (!space || !space.isActive) return { error: "notFound" as const };

  const conflict = await prisma.booking.findFirst({
    where: {
      spaceId,
      status: { not: "canceled" },
      ...buildOverlapFilter(start, end),
    },
  });
  if (conflict) return { error: "conflict" as const };

  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  const totalPrice = parseFloat((durationHours * space.pricePerHour).toFixed(2));

  const booking = await prisma.booking.create({
    data: { userId, spaceId, startTime: start, endTime: end, status: "pending", totalPrice },
  });

  pubsub.publish(BOOKING_CREATED, {
    spaceAvailability: {
      spaceId: booking.spaceId,
      spaceName: space.name,
      location: space.location,
      isAvailable: false,
      startTime: booking.startTime.toISOString(),
      endTime: booking.endTime.toISOString(),
    },
  });

  return { booking };
}

export async function listReservations(role: string, userId: number) {
  const where = role === "admin" ? {} : { userId };
  return prisma.booking.findMany({
    where,
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      space: true,
    },
  });
}

export async function getReservationById(id: number) {
  return prisma.booking.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
      space: true,
    },
  });
}

export async function cancelReservation(
  id: number,
  spaceId: number,
  startTime: Date,
  endTime: Date,
) {
  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "canceled" },
  });

  const space = await prisma.space.findUnique({ where: { id: spaceId } });
  if (space) {
    pubsub.publish(BOOKING_CREATED, {
      spaceAvailability: {
        spaceId: space.id,
        spaceName: space.name,
        location: space.location,
        isAvailable: true,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      },
    });
  }

  return updated;
}
