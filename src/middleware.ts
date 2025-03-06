import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  try {
    jwt.verify(token, process.env.JWT_SECRET as string);
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}
