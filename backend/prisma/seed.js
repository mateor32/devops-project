require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashed = await bcrypt.hash("admin123", 10);

  await prisma.user.upsert({
    where: { email: "admin@nutrigym.com" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@nutrigym.com",
      password: hashed,
      role: "ADMIN",
      isApproved: true,
    },
  });

  console.log("✅ Admin creado: admin@nutrigym.com / admin123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
