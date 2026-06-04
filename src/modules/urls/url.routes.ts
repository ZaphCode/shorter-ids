import { Router } from "express";
import { DataSource } from "typeorm";
import { createAuthenticateMiddleware } from "../../shared/auth";
import { asyncHandler } from "../../shared/async-handler";
import { HttpError } from "../../shared/http-error";
import { createRequireActiveSubscriptionMiddleware } from "../../shared/subscription";
import { UrlService } from "./url.service";

type UrlRouterDependencies = {
  dataSource: DataSource;
  jwtSecret?: string;
  baseUrl?: string;
};

export function createUrlManagementRouter({
  dataSource,
  jwtSecret = process.env.JWT_SECRET || "dev-secret",
  baseUrl = process.env.APP_BASE_URL || "http://localhost:3000"
}: UrlRouterDependencies) {
  const router = Router();
  const authenticate = createAuthenticateMiddleware(jwtSecret);
  const requireSubscription = createRequireActiveSubscriptionMiddleware(dataSource);
  const service = new UrlService({ dataSource, baseUrl });

  router.use(authenticate, requireSubscription);

  router.post(
    "/",
    asyncHandler(async (req, res) => {
      if (!req.auth?.sub) {
        throw new HttpError(401, "Usuario no autenticado");
      }

      const shortUrl = await service.create(req.auth.sub, req.body);
      res.status(201).json(shortUrl);
    })
  );

  router.get(
    "/",
    asyncHandler(async (req, res) => {
      if (!req.auth?.sub) {
        throw new HttpError(401, "Usuario no autenticado");
      }

      const urls = await service.list(req.auth.sub);
      res.json(urls);
    })
  );

  router.get(
    "/:id",
    asyncHandler(async (req, res) => {
      if (!req.auth?.sub) {
        throw new HttpError(401, "Usuario no autenticado");
      }

      const shortUrl = await service.getById(req.auth.sub, req.params.id);
      res.json(shortUrl);
    })
  );

  router.put(
    "/:id",
    asyncHandler(async (req, res) => {
      if (!req.auth?.sub) {
        throw new HttpError(401, "Usuario no autenticado");
      }

      const shortUrl = await service.update(req.auth.sub, req.params.id, req.body);
      res.json(shortUrl);
    })
  );

  router.patch(
    "/:id/activate",
    asyncHandler(async (req, res) => {
      if (!req.auth?.sub) {
        throw new HttpError(401, "Usuario no autenticado");
      }

      const shortUrl = await service.activate(req.auth.sub, req.params.id);
      res.json(shortUrl);
    })
  );

  router.patch(
    "/:id/deactivate",
    asyncHandler(async (req, res) => {
      if (!req.auth?.sub) {
        throw new HttpError(401, "Usuario no autenticado");
      }

      const shortUrl = await service.deactivate(req.auth.sub, req.params.id);
      res.json(shortUrl);
    })
  );

  router.delete(
    "/:id",
    asyncHandler(async (req, res) => {
      if (!req.auth?.sub) {
        throw new HttpError(401, "Usuario no autenticado");
      }

      await service.remove(req.auth.sub, req.params.id);
      res.status(204).send();
    })
  );

  return router;
}

export function createPublicUrlRouter({ dataSource, baseUrl }: UrlRouterDependencies) {
  const router = Router();
  const service = new UrlService({
    dataSource,
    baseUrl: baseUrl || process.env.APP_BASE_URL || "http://localhost:3000"
  });

  router.get(
    "/:shortCode",
    asyncHandler(async (req, res) => {
      const originalUrl = await service.resolveByShortCode(req.params.shortCode);
      res.redirect(originalUrl);
    })
  );

  return router;
}
