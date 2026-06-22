require("dotenv").config({ path: require("path").join(__dirname, "..", ".env.local") });
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const prisma = new PrismaClient();

async function seed() {
  const adminPass = await bcrypt.hash("Admin123!", 12);
  const adminId = uuidv4().slice(0, 12);

  try {
    await prisma.user.upsert({
      where: { email: "admin@absenyuk.id" },
      update: {},
      create: {
        id: adminId,
        username: "admin",
        email: "admin@absenyuk.id",
        password: adminPass,
        role: "admin",
      },
    });
    console.log("Seed complete: admin user created");
  } catch (err) {
    console.error("Seed failed:", err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
