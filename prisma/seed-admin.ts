import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // 최고관리자 생성
  const hashedPassword = await bcrypt.hash("admin1234!", 12);

  const superAdmin = await prisma.admin.upsert({
    where: { email: "admin@eldertrien.com" },
    update: {},
    create: {
      email: "admin@eldertrien.com",
      password: hashedPassword,
      name: "최고관리자",
      role: "SUPER_ADMIN",
      permissions: ["menus", "contents", "inquiries", "analytics", "settings", "admins"],
      isActive: true,
    },
  });

  console.log("최고관리자 생성 완료:", superAdmin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
