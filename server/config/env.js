import "dotenv/config";

const parseCsv = (value, fallback) => {
  if (!value) return fallback;
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number.parseInt(process.env.PORT || "5000", 10),
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  corsOrigins: parseCsv(process.env.CORS_ORIGINS, ["http://localhost:5173"]),
  db: {
    name: process.env.DB_NAME || "ems",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432", 10),
  },
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET || "dev_access_secret_change_me",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "dev_refresh_secret_change_me",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  },
  mail: {
    user: process.env.SMTP_USER || "",
    pass: process.env.SMTP_PASS || "",
  },
};

if (env.db.password === "CHANGE_ME_POSTGRES_PASSWORD") {
  throw new Error(
    "Invalid DB_PASSWORD in server/.env. Replace CHANGE_ME_POSTGRES_PASSWORD with your actual PostgreSQL password.",
  );
}

if (env.nodeEnv === "production") {
  const required = [
    ["DB_NAME", process.env.DB_NAME],
    ["DB_USER", process.env.DB_USER],
    ["DB_PASSWORD", process.env.DB_PASSWORD],
    ["JWT_ACCESS_SECRET", process.env.JWT_ACCESS_SECRET],
    ["JWT_REFRESH_SECRET", process.env.JWT_REFRESH_SECRET],
    ["SMTP_USER", process.env.SMTP_USER],
    ["SMTP_PASS", process.env.SMTP_PASS],
  ];

  const missing = required.filter(([, value]) => !value).map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }
}
