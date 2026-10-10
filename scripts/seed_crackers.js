#!/usr/bin/env node

/**
 * Santhi Crackers - 100 Products & 10 Categories Seeder
 * Sends HTTP requests to:
 *   - POST http://localhost:3007/api/categories
 *   - POST http://localhost:3007/api/product
 */

const fs = require("fs");
const path = require("path");

const API_BASE = process.env.API_BASE || "http://localhost:3007/api";
const categoriesPath = path.join(__dirname, "data", "categories.json");
const productsPath = path.join(__dirname, "data", "products.json");

const categories = JSON.parse(fs.readFileSync(categoriesPath, "utf-8"));
const products = JSON.parse(fs.readFileSync(productsPath, "utf-8"));

async function postJson(url, data) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  const body = await response.json().catch(() => ({}));
  return { status: response.status, body };
}

async function main() {
  console.log("\n======================================================================");
  console.log("   🎆 SANTHI CRACKERS - 100 CRACKERS & 10 CATEGORIES SEED SCRIPT 🎆   ");
  console.log("======================================================================");
  console.log(`Target API Base : ${API_BASE}`);
  console.log(`Categories     : ${categories.length} entries`);
  console.log(`Products       : ${products.length} entries\n`);

  // Connectivity check
  try {
    const health = await fetch(`${API_BASE}/categories`);
    if (!health.ok && health.status !== 200) {
      console.warn(`[Warning] Health check returned status: ${health.status}`);
    } else {
      console.log("✓ Backend is reachable!\n");
    }
  } catch (err) {
    console.error(`✗ Cannot connect to backend at ${API_BASE}:`, err.message);
    process.exit(1);
  }

  // 1. Seed Categories
  console.log("----------------------------------------------------------------------");
  console.log(" STEP 1: Seeding 10 Categories via POST " + `${API_BASE}/categories`);
  console.log("----------------------------------------------------------------------");

  let catCreated = 0;
  let catExists = 0;
  let catFailed = 0;

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const prefix = ` [${String(i + 1).padStart(2, " ")}/${categories.length}]`;
    try {
      const res = await postJson(`${API_BASE}/categories`, cat);
      if (res.status === 201 || res.status === 200) {
        console.log(`${prefix} ✓ Created : ${cat.name} (${cat.slug})`);
        catCreated++;
      } else if (res.status === 409) {
        console.log(`${prefix} • Exists  : ${cat.name} (${cat.slug})`);
        catExists++;
      } else {
        console.error(`${prefix} ✗ Error (${res.status}): ${cat.name} -`, res.body?.error || res.body);
        catFailed++;
      }
    } catch (e) {
      console.error(`${prefix} ✗ Network Error:`, e.message);
      catFailed++;
    }
  }

  console.log(`\nCategories Summary: ${catCreated} created, ${catExists} already existed, ${catFailed} failed.\n`);

  // 2. Seed Products
  console.log("----------------------------------------------------------------------");
  console.log(" STEP 2: Seeding 100 Crackers via POST " + `${API_BASE}/product`);
  console.log("----------------------------------------------------------------------");

  let prodCreated = 0;
  let prodExists = 0;
  let prodFailed = 0;

  for (let i = 0; i < products.length; i++) {
    const prod = products[i];
    const prefix = ` [${String(i + 1).padStart(3, " ")}/${products.length}]`;
    try {
      const res = await postJson(`${API_BASE}/product`, prod);
      if (res.status === 201 || res.status === 200) {
        console.log(`${prefix} ✓ Created : ${prod.code} | ${prod.name} (₹${prod.price}, ${prod.categorySlug})`);
        prodCreated++;
      } else if (res.status === 409) {
        console.log(`${prefix} • Exists  : ${prod.code} | ${prod.name}`);
        prodExists++;
      } else {
        console.error(`${prefix} ✗ Error (${res.status}): ${prod.code} -`, res.body?.error || res.body);
        prodFailed++;
      }
    } catch (e) {
      console.error(`${prefix} ✗ Network Error:`, e.message);
      prodFailed++;
    }
  }

  console.log("\n======================================================================");
  console.log("               🎉 SEEDING COMPLETED SUCCESSFULLY! 🎉                 ");
  console.log("======================================================================");
  console.log(`  Categories Processed : ${categories.length} (${catCreated} created, ${catExists} already existed)`);
  console.log(`  Products Processed   : ${products.length} (${prodCreated} created, ${prodExists} already existed)`);
  if (catFailed > 0 || prodFailed > 0) {
    console.log(`  Failures Encountered : ${catFailed + prodFailed}`);
  }
  console.log("======================================================================\n");
}

main().catch((err) => {
  console.error("Fatal Seeding Error:", err);
  process.exit(1);
});
