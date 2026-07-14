import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma";
import { JWT_SECRET } from "../config";

export async function registerUser(name: string, email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { name, email, password: hashedPassword, role: "member" },
    });
    const startDate = new Date();
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 1);
    await tx.membership.create({
      data: { userId: newUser.id, plan: "basic", startDate, endDate },
    });
    return newUser;
  });

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" },
  );

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) return null;

  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "8h" },
  );

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}
