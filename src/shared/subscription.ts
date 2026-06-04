import { NextFunction, Request, Response } from "express";
import { DataSource } from "typeorm";
import { SUBSCRIPTION_DURATION_DAYS } from "../config/constants";
import { SubscriptionEntity } from "../db/entities/Subscription.entity";
import { HttpError } from "./http-error";

const ONE_DAY_IN_MS = 24 * 60 * 60 * 1000;

export function resolveSubscriptionStatus(subscription: SubscriptionEntity | null, now = new Date()) {
  if (!subscription) {
    return "inactive";
  }

  return new Date(subscription.expiresAt).getTime() > now.getTime() ? "active" : "expired";
}

export function getNextExpirationDate(baseDate: Date) {
  return new Date(baseDate.getTime() + SUBSCRIPTION_DURATION_DAYS * ONE_DAY_IN_MS);
}

export function createRequireActiveSubscriptionMiddleware(dataSource: DataSource) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth?.sub) {
      return next(new HttpError(401, "Usuario no autenticado"));
    }

    const subscriptionRepository = dataSource.getRepository(SubscriptionEntity);
    const subscription = await subscriptionRepository.findOne({
      where: { userId: req.auth.sub }
    });

    const status = resolveSubscriptionStatus(subscription);

    if (status !== "active" || !subscription) {
      return next(new HttpError(403, "Se requiere una suscripcion activa"));
    }

    req.subscription = subscription;
    next();
  };
}
