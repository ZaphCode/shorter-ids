import { Router } from "express";
import { DataSource } from "typeorm";
import { createAuthenticateMiddleware } from "../../shared/auth";
import { asyncHandler } from "../../shared/async-handler";
import { HttpError } from "../../shared/http-error";
import { SubscriptionService } from "../subscriptions/subscriptions.service";

type PaymentsRouterDependencies = {
  dataSource: DataSource;
  jwtSecret: string;
};

export function createPaymentsRouter({ dataSource, jwtSecret }: PaymentsRouterDependencies) {
  const router = Router();
  const authenticate = createAuthenticateMiddleware(jwtSecret);
  const service = new SubscriptionService({ dataSource });

  router.get(
    "/history",
    authenticate,
    asyncHandler(async (req, res) => {
      if (!req.auth?.sub) {
        throw new HttpError(401, "Usuario no autenticado");
      }

      const payments = await service.getPaymentHistory(req.auth.sub);
      res.json(payments);
    })
  );

  return router;
}
