import "dotenv/config";
import { start } from "./slack/bot";
import prisma from "./database/client";

async function main() {
  console.log("🚀 Starting Second Me...");
  const userCount = await prisma.user.count();
  console.log("✅ Database connected! Users:", userCount);
  await start();
  console.log("✨ Ready! Type /secondme in Slack");
}

main().catch(console.error);
