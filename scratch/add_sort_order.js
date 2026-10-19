import { db } from '../packages/db/dist/src/client.js';

async function main() {
  const query = 'ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;';
  await db.$executeRawUnsafe(query);
  console.log("SUCCESS: sortOrder column ensured on Product table");
  const p = await db.product.findFirst();
  console.log("Product keys:", Object.keys(p));
  process.exit(0);
}

main().catch(err => {
  console.error("Migration error:", err);
  process.exit(1);
});
