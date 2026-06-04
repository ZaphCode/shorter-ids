function readRequiredEnv(name: string): string {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`La variable de entorno ${name} es requerida`);
  }

  return value;
}

function readNumberEnv(name: string, defaultValue: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return defaultValue;
  }

  const parsed = Number(rawValue);

  if (Number.isNaN(parsed)) {
    throw new Error(`La variable de entorno ${name} debe ser numerica`);
  }

  return parsed;
}

const port = readNumberEnv("PORT", 3000);

export const env = {
  port,
  baseUrl: process.env.APP_BASE_URL?.trim() || `http://localhost:${port}`,
  jwtSecret: readRequiredEnv("JWT_SECRET"),
  db: {
    host: process.env.DB_HOST?.trim() || "localhost",
    port: readNumberEnv("DB_PORT", 5432),
    username: process.env.DB_USER?.trim() || "postgres",
    password: process.env.DB_PASSWORD?.trim() || "postgres",
    database: process.env.DB_NAME?.trim() || "shorter",
    synchronize: process.env.DB_SYNCHRONIZE !== "false"
  }
};
