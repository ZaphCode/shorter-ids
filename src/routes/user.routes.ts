import { Router } from "express";
import { randomUUID } from "crypto";
import { users } from "../store";
import { hashPassword, verifyPassword } from "../utils/password";
import { normalizeEmail, readRequiredString } from "../utils/validation";

export const userRouter = Router();

userRouter.post("/register", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = readRequiredString(req.body.password);

  if (!email || !password) {
    return res.status(400).json({ message: "email y password son requeridos" });
  }

  if (users.has(email)) {
    return res.status(409).json({ message: "El email ya existe" });
  }

  const now = new Date();
  const user = {
    id: randomUUID(),
    email,
    passwordHash: hashPassword(password),
    isVerified: false,
    verificationCode: "123456",
    createdAt: now,
    updatedAt: now
  };

  users.set(email, user);

  return res.status(201).json({
    id: user.id,
    email: user.email,
    isVerified: user.isVerified,
    verificationCode: user.verificationCode
  });
});

userRouter.post("/login", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = readRequiredString(req.body.password);

  if (!email || !password) {
    return res.status(400).json({ message: "email y password son requeridos" });
  }

  const user = users.get(email);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ message: "Credenciales invalidas" });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: "El usuario no esta verificado" });
  }

  return res.json({ isValidUser: true });
});

userRouter.post("/verify", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const code = readRequiredString(req.body.code);

  if (!email || !code) {
    return res.status(400).json({ message: "email y code son requeridos" });
  }

  const user = users.get(email);

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  if (user.verificationCode !== code) {
    return res.status(400).json({ message: "Codigo invalido" });
  }

  user.isVerified = true;
  user.updatedAt = new Date();

  return res.json({ email: user.email, isVerified: user.isVerified });
});
