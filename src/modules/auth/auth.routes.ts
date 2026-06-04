import { Router } from "express";
import { DataSource } from "typeorm";
import { asyncHandler } from "../../shared/async-handler";
import { AuthService } from "./auth.service";

type AuthRouterDependencies = {
  dataSource: DataSource;
  jwtSecret: string;
};

export function createAuthRouter({ dataSource, jwtSecret }: AuthRouterDependencies) {
  const router = Router();
  const service = new AuthService({ dataSource, jwtSecret });

  router.post(
    "/register",
    asyncHandler(async (req, res) => {
      const user = await service.register(req.body);
      res.status(201).json(user);
    })
  );

  router.post(
    "/login",
    asyncHandler(async (req, res) => {
      const session = await service.login(req.body);
      res.json(session);
    })
  );

  return router;
}
