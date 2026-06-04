import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { HttpError } from "./http-error";

export type AuthPayload = {
  sub: string;
  email: string;
};

export function createAuthToken(payload: AuthPayload, jwtSecret: string) {
  return jwt.sign(payload, jwtSecret, { expiresIn: "1d" });
}

export function createAuthenticateMiddleware(jwtSecret: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const authorization = req.header("authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return next(new HttpError(401, "Token requerido"));
    }

    const token = authorization.replace("Bearer ", "").trim();

    try {
      const payload = jwt.verify(token, jwtSecret) as AuthPayload;
      req.auth = payload;
      next();
    } catch {
      next(new HttpError(401, "Token invalido"));
    }
  };
}
