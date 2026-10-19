import { defineConfig } from "prisma/config";

try {
  const dotenv = await import("dotenv");
  dotenv.config({ path: "../../.env" });
} catch {
  // Ignore missing dotenv in production where environment variables are already set
}

const databaseUrl =
  process.env.DATABASE_URL ||
  "postgresql://placeholder:placeholder@localhost:5432/placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
