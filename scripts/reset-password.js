/**
 * Run this once to create or reset the admin user password.
 * Usage: node scripts/reset-password.js
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email    = "admin@driveease.com";
  const password = "123456";
  const name     = "Admin";

  const hash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where:  { email },
    update: { password: hash },
    create: { name, email, password: hash },
  });

  console.log(`✅ User ready: ${user.email} (id: ${user.id})`);
  console.log(`   You can now log in with: ${email} / ${password}`);
}

main()
  .catch(e => { console.error("❌", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
