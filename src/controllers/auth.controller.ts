import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  if (!name || name.trim().length === 0)
    return res.status(400).json({ error: "name is required" });
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return res.status(400).json({ error: "valid email is required" });
  if (!password || password.length < 6)
    return res.status(400).json({ error: "password must be at least 6 characters" });

  try {
    const result = await registerUser(name, email, password);
    res.status(201).json(result);
  } catch (error: any) {
    if (error.code === "P2002")
      return res.status(409).json({ error: "email already in use" });
    res.status(500).json({ error: error.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    if (!result) return res.status(401).json({ error: "invalid credentials" });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
