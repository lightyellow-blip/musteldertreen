import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // 런타임: pooler 사용 (6543)
    url: process.env["DATABASE_URL"],
  },
});
