import { Request, Response } from "express";
import * as authService from "./user.service";

export async function register(req: Request, res: Response) {
  try {
    const { email, name, password } = req.body;
    if (!email || !password || !name) return res.status(422).json({ message: "Missing fields" });
    const result = await authService.registerUser(email, name, password);
    return res.status(201).json(result);
  } catch (err: any) {
    if (err.message === "EMAIL_EXISTS") return res.status(409).json({ message: "Email already exists" });
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(422).json({ message: "Missing fields" });
    const result = await authService.loginUser(email, password);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err.message === "INVALID_CREDENTIALS") return res.status(401).json({ message: "Invalid credentials" });
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}

export async function refresh(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(422).json({ message: "Missing refresh token" });
    const tokens = await authService.refreshTokens(refreshToken);
    return res.status(200).json(tokens);
  } catch (err: any) {
    return res.status(401).json({ message: "Invalid refresh token" });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(422).json({ message: "Missing refresh token" });
    await authService.logoutUser(refreshToken);
    return res.status(200).json({ message: "Logged out" });
  } catch (err: any) {
    return res.status(500).json({ message: "Server error" });
  }
}
