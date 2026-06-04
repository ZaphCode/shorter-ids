import "reflect-metadata";
import express, { NextFunction, Request, Response } from "express";
import { DataSource } from "typeorm";
import { createAuthRouter } from "./modules/auth/auth.routes";
import { createPaymentsRouter } from "./modules/payments/payments.routes";
import { createSubscriptionsRouter } from "./modules/subscriptions/subscriptions.routes";
import { createPublicUrlRouter, createUrlManagementRouter } from "./modules/urls/url.routes";
import { HttpError } from "./shared/http-error";

export type AppDependencies = {
  dataSource: DataSource;
  jwtSecret: string;
  baseUrl: string;
};

export function createApp({ dataSource, jwtSecret, baseUrl }: AppDependencies) {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", createAuthRouter({ dataSource, jwtSecret }));
  app.use("/subscriptions", createSubscriptionsRouter({ dataSource, jwtSecret }));
  app.use("/payments", createPaymentsRouter({ dataSource, jwtSecret }));
  app.use("/urls", createUrlManagementRouter({ dataSource, jwtSecret, baseUrl }));
  app.use("/url", createPublicUrlRouter({ dataSource }));

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (error instanceof HttpError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.error(error);

    return res.status(500).json({ message: "Error interno del servidor" });
  });

  return app;
}
