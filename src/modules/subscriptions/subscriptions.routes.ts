import { Router } from "express";
import { DataSource } from "typeorm";
import { createAuthenticateMiddleware } from "../../shared/auth";
import { asyncHandler } from "../../shared/async-handler";
import { HttpError } from "../../shared/http-error";
import { SubscriptionService } from "./subscriptions.service";

type SubscriptionsRouterDependencies = {
  dataSource: DataSource;
  jwtSecret: string;
};

export function createSubscriptionsRouter({ dataSource, jwtSecret }: SubscriptionsRouterDependencies) {
  const router = Router();
  const authenticate = createAuthenticateMiddleware(jwtSecret);
  const service = new SubscriptionService({ dataSource });

  router.post(
    "/pay",
    authenticate,
    asyncHandler(async (req, res) => {
      if (!req.auth?.sub) {
        throw new HttpError(401, "Usuario no autenticado");
      }

      const result = await service.pay(req.auth.sub);
      res.status(201).json(result);
    })
  );

  router.get(
    "/me",
    authenticate,
    asyncHandler(async (req, res) => {
      if (!req.auth?.sub) {
        throw new HttpError(401, "Usuario no autenticado");
      }

      const subscription = await service.getCurrent(req.auth.sub);
      res.json(subscription);
    })
  );

  return router;
}
