// Manually load .env / .env.local before Prisma Client initializes
const fs   = require("fs");
const path = require("path");

function loadEnv() {
  const files = [".env.local", ".env"];
  for (const file of files) {
    const filePath = path.join(__dirname, "..", file);
    if (!fs.existsSync(filePath)) continue;
    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) process.env[key] = val;
    }
    console.log(`Loaded env from: ${file}`);
    break;
  }
}

loadEnv();

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email    = "admin@driveease.com";
  const password = "123456";

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.log("❌ User NOT found — creating now...");
    const hash = await bcrypt.hash(password, 10);
    const created = await prisma.user.create({
      data: { name: "Admin", email, password: hash },
    });
    console.log(`✅ User created: ${created.email}`);
    console.log(`   Login with: ${email} / ${password}`);
    return;
  }

  console.log(`✅ User found: id=${user.id}, email=${user.email}`);

  const isMatch = await bcrypt.compare(password, user.password);
  console.log(`   bcrypt.compare("${password}") = ${isMatch}`);

  if (!isMatch) {
    console.log("⚠️  Hash mismatch — updating password now...");
    const newHash = await bcrypt.hash(password, 10);
    await prisma.user.update({ where: { email }, data: { password: newHash } });
    console.log(`✅ Password updated. Login with: ${email} / ${password}`);
  } else {
    console.log("✅ Password already correct. Login should work.");
  }
}

main()
  .catch(e => { console.error("❌ Error:", e.message); process.exit(1); })
  .finally(() => prisma.$disconnect());
