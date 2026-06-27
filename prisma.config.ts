import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

// Replaces the deprecated `package.json#prisma` key. Note: with a config file
// present, Prisma no longer auto-loads .env, so we import dotenv above.
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
