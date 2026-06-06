import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { UserRole } from "../src/types/enums";
import { prisma } from "../src/db/prisma";

dotenv.config();

async function main() {
  const name = process.env.SEED_ADMIN_NAME ?? "LifeLink Admin";
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@lifelink.local";
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password || password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters");
  }

  const existingAdmin = await prisma.user.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (existingAdmin) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: UserRole.ADMIN
    }
  });

  console.log(`Created admin user: ${email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
