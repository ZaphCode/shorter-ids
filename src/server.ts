import "dotenv/config";
import { createApp } from "./app";
import { env } from "./config/env";
import { createPostgresDataSource } from "./db/create-data-source";

async function bootstrap() {
  const dataSource = createPostgresDataSource(env);

  await dataSource.initialize();

  const app = createApp({
    dataSource,
    jwtSecret: env.jwtSecret,
    baseUrl: env.baseUrl
  });

  app.listen(env.port, () => {
    console.log(`API escuchando en ${env.baseUrl}`);
  });
}

bootstrap().catch((error) => {
  console.error("No se pudo iniciar la API", error);
  process.exit(1);
});
