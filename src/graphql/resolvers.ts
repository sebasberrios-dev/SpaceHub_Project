import { pubsub, BOOKING_CREATED } from "./pubsub";
import prisma from "../lib/prisma";

export const resolvers = {
  Query: {
    occupancyAnalytics: async (
      _: any,
      { startDate, endDate }: { startDate?: string; endDate?: string },
      context: any,
    ) => {
      if (context.user?.role !== "admin") {
        throw new Error("Admin access required");
      }

      const start = startDate
        ? new Date(startDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const end = endDate ? new Date(endDate) : new Date();

      const [bookings, spaces] = await Promise.all([
        prisma.booking.findMany({
          where: {
            status: { not: "canceled" },
            startTime: { gte: start },
            endTime: { lte: end },
          },
          include: { space: true, user: true },
        }),
        prisma.space.findMany({ where: { isActive: true } }),
      ]);

      const daysInPeriod = Math.max(
        1,
        (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );

      const locationMap = new Map<
        string,
        { spaceCount: number; bookedHours: number }
      >();
      for (const space of spaces) {
        const entry = locationMap.get(space.location) ?? {
          spaceCount: 0,
          bookedHours: 0,
        };
        entry.spaceCount++;
        locationMap.set(space.location, entry);
      }
      for (const booking of bookings) {
        const loc = booking.space.location;
        if (!locationMap.has(loc)) continue;
        const hours =
          (booking.endTime.getTime() - booking.startTime.getTime()) /
          (1000 * 60 * 60);
        locationMap.get(loc)!.bookedHours += hours;
      }
      const occupancyByLocation = Array.from(locationMap.entries()).map(
        ([location, data]) => ({
          location,
          spaceCount: data.spaceCount,
          bookedHours: parseFloat(data.bookedHours.toFixed(2)),
          occupancyRate: parseFloat(
            (
              (data.bookedHours / (data.spaceCount * 24 * daysInPeriod)) *
              100
            ).toFixed(2),
          ),
        }),
      );

      const typeMap = new Map<
        string,
        { spaceCount: number; bookedHours: number }
      >();
      for (const space of spaces) {
        const entry = typeMap.get(space.type) ?? {
          spaceCount: 0,
          bookedHours: 0,
        };
        entry.spaceCount++;
        typeMap.set(space.type, entry);
      }
      for (const booking of bookings) {
        const type = booking.space.type;
        if (!typeMap.has(type)) continue;
        const hours =
          (booking.endTime.getTime() - booking.startTime.getTime()) /
          (1000 * 60 * 60);
        typeMap.get(type)!.bookedHours += hours;
      }
      const occupancyByType = Array.from(typeMap.entries()).map(
        ([type, data]) => ({
          type,
          spaceCount: data.spaceCount,
          bookedHours: parseFloat(data.bookedHours.toFixed(2)),
          occupancyRate: parseFloat(
            (
              (data.bookedHours / (data.spaceCount * 24 * daysInPeriod)) *
              100
            ).toFixed(2),
          ),
        }),
      );

      const totalRevenue = parseFloat(
        bookings.reduce((sum, b) => sum + b.totalPrice, 0).toFixed(2),
      );

      const revenueMap = new Map<string, number>();
      for (const booking of bookings) {
        const month = booking.startTime.toISOString().substring(0, 7);
        revenueMap.set(
          month,
          (revenueMap.get(month) ?? 0) + booking.totalPrice,
        );
      }
      const revenueByPeriod = Array.from(revenueMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([period, revenue]) => ({
          period,
          revenue: parseFloat(revenue.toFixed(2)),
        }));

      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      const expiringData = await prisma.membership.findMany({
        where: { endDate: { gt: new Date(), lte: thirtyDaysFromNow } },
        include: { user: true },
      });
      const expiringMemberships = expiringData.map((m) => ({
        userId: m.userId,
        userName: m.user.name,
        plan: m.plan,
        endDate: m.endDate.toISOString(),
      }));

      const userMap = new Map<
        number,
        {
          userId: number;
          userName: string;
          bookingCount: number;
          totalSpent: number;
        }
      >();
      for (const booking of bookings) {
        const entry = userMap.get(booking.userId) ?? {
          userId: booking.userId,
          userName: booking.user.name,
          bookingCount: 0,
          totalSpent: 0,
        };
        entry.bookingCount++;
        entry.totalSpent += booking.totalPrice;
        userMap.set(booking.userId, entry);
      }
      const topUsers = Array.from(userMap.values())
        .sort((a, b) => b.bookingCount - a.bookingCount)
        .slice(0, 10)
        .map((u) => ({
          ...u,
          totalSpent: parseFloat(u.totalSpent.toFixed(2)),
        }));

      return {
        occupancyByLocation,
        occupancyByType,
        totalRevenue,
        revenueByPeriod,
        expiringMemberships,
        topUsers,
      };
    },
  },

  Subscription: {
    spaceAvailability: {
      subscribe: () => pubsub.asyncIterableIterator([BOOKING_CREATED]),
      resolve: (payload: any) => payload.spaceAvailability,
    },
  },
};
