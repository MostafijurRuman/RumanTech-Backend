import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, UserRole } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS ?? 12);

const demoUsers = [
  {
    name: "RumanTech Admin",
    email: "admin@rumantech.com",
    password: "Admin@123",
    role: UserRole.ADMIN,
  },
  {
    name: "RumanTech Demo User",
    email: "user@rumantech.com",
    password: "User@123",
    role: UserRole.USER,
  },
];

async function main() {
  for (const demoUser of demoUsers) {
    await prisma.user.upsert({
      where: { email: demoUser.email },
      update: {
        name: demoUser.name,
        role: demoUser.role,
        isActive: true,
        deletedAt: null,
        passwordHash: await bcrypt.hash(demoUser.password, saltRounds),
      },
      create: {
        name: demoUser.name,
        email: demoUser.email,
        role: demoUser.role,
        isActive: true,
        passwordHash: await bcrypt.hash(demoUser.password, saltRounds),
      },
    });
  }

  console.log("Demo auth users are ready.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
