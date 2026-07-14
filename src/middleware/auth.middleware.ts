import { Request, Response, NextFunction } from "express";
import { AuthUser } from "../types";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "token required" });
  }

  const token = authHeader.split(" ")[1];

  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthUser;
    next();
  } catch (error) {
    return res.status(401).json({ error: "invalid token" });
  }
};

export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "admin access required" });
  }
  next();
};
