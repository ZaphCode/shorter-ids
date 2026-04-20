import { Router } from "express";
import { randomUUID } from "crypto";
import { urlsByCode, urlsById, users } from "../store";
import { createUniqueShortCode } from "../utils/shortCode";
import { normalizeEmail, normalizeUrl, readRequiredString } from "../utils/validation";

export const urlRouter = Router();

urlRouter.post("/", (req, res) => {
  const email = normalizeEmail(req.body.email);
  const originalUrl = normalizeUrl(req.body.originalUrl);

  if (!email || !originalUrl) {
    return res.status(400).json({ message: "email y originalUrl son requeridos" });
  }

  const user = users.get(email);

  if (!user) {
    return res.status(404).json({ message: "Usuario no encontrado" });
  }

  if (!user.isVerified) {
    return res.status(403).json({ message: "El usuario debe estar verificado" });
  }

  const shortCode = createUniqueShortCode();
  const now = new Date();
  const shortUrl = {
    id: randomUUID(),
    userEmail: email,
    originalUrl,
    shortCode,
    shortUrl: `${req.protocol}://${req.get("host")}/url/${shortCode}`,
    isActive: true,
    createdAt: now,
    updatedAt: now
  };

  urlsById.set(shortUrl.id, shortUrl);
  urlsByCode.set(shortCode, shortUrl);

  return res.status(201).json(shortUrl);
});

urlRouter.get("/:shortCode", (req, res) => {
  const shortCode = readRequiredString(req.params.shortCode);

  if (!shortCode) {
    return res.status(400).json({ message: "shortCode es requerido" });
  }

  const shortUrl = urlsByCode.get(shortCode);

  if (!shortUrl) {
    return res.status(404).json({ message: "URL corta no encontrada" });
  }

  if (!shortUrl.isActive) {
    return res.status(410).json({ message: "URL corta desactivada" });
  }

  return res.redirect(shortUrl.originalUrl);
});

urlRouter.patch("/:id/deactivate", (req, res) => {
  const id = readRequiredString(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "id es requerido" });
  }

  const shortUrl = urlsById.get(id);

  if (!shortUrl) {
    return res.status(404).json({ message: "URL no encontrada" });
  }

  shortUrl.isActive = false;
  shortUrl.updatedAt = new Date();

  return res.json(shortUrl);
});

urlRouter.patch("/:id/activate", (req, res) => {
  const id = readRequiredString(req.params.id);

  if (!id) {
    return res.status(400).json({ message: "id es requerido" });
  }

  const shortUrl = urlsById.get(id);

  if (!shortUrl) {
    return res.status(404).json({ message: "URL no encontrada" });
  }

  shortUrl.isActive = true;
  shortUrl.updatedAt = new Date();

  return res.json(shortUrl);
});
