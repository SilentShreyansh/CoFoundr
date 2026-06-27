import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Dummy URL so importing the Prisma client singleton doesn't complain;
    // tests never actually query the database.
    env: { DATABASE_URL: "postgresql://user:pass@localhost:5432/cofoundr" },
  },
});
