const fs = require("fs");
const path = require("path");

const API_URL = "http://localhost:3007/api/product";
const DATA_FILE = path.join(__dirname, "products.json");

async function createProducts() {
  try {
    const fileContent = fs.readFileSync(DATA_FILE, "utf8");
    const products = JSON.parse(fileContent);

    if (!Array.isArray(products)) {
      throw new Error("data.json must contain an array of products.");
    }

    console.log(`Found ${products.length} products.\n`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < products.length; i++) {
      const product = products[i];

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(product),
        });

        const responseText = await response.text();

        if (!response.ok) {
          failureCount++;
          console.error(
            `[${i + 1}/${products.length}] FAILED: ${product.nameEng || product.code}`,
            `(${response.status})`,
            responseText
          );
          continue;
        }

        successCount++;

        console.log(
          `[${i + 1}/${products.length}] CREATED: ${product.nameEng || product.code}`
        );
      } catch (error) {
        failureCount++;

        console.error(
          `[${i + 1}/${products.length}] ERROR: ${product.nameEng || product.code}`,
          error.message
        );
      }
    }

    console.log("\n========== SUMMARY ==========");
    console.log(`Total products: ${products.length}`);
    console.log(`Created: ${successCount}`);
    console.log(`Failed: ${failureCount}`);
    console.log("=============================");
  } catch (error) {
    console.error("Failed to process products:", error.message);
    process.exitCode = 1;
  }
}

createProducts();