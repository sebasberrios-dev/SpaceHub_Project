import { MembershipPlan } from "@prisma/client";
import prisma from "../lib/prisma";

export async function listMemberships() {
  return prisma.membership.findMany({
    where: { endDate: { gt: new Date() } },
    include: {
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

export async function updateMembership(userId: number, plan: string) {
  const membership = await prisma.membership.findUnique({ where: { userId } });
  if (!membership) return null;
  return prisma.membership.update({
    where: { userId },
    data: { plan: plan as MembershipPlan },
  });
}
