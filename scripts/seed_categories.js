const fs = require("fs");
const path = require("path");

const API_URL = "http://localhost:3007/api/categories";
const DATA_FILE = path.join(__dirname, "categories.json");

async function createCategories() {
  try {
    const fileContent = fs.readFileSync(DATA_FILE, "utf8");
    const categories = JSON.parse(fileContent);

    if (!Array.isArray(categories)) {
      throw new Error("categories.json must contain an array.");
    }

    console.log(`Found ${categories.length} categories.\n`);

    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];

      try {
        const response = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(category),
        });

        const responseText = await response.text();

        if (!response.ok) {
          failureCount++;
          console.error(
            `[${i + 1}/${categories.length}] FAILED: ${category.nameEng}`,
            `Status: ${response.status}`,
            responseText
          );
          continue;
        }

        successCount++;
        console.log(
          `[${i + 1}/${categories.length}] CREATED: ${category.nameEng}`
        );
      } catch (error) {
        failureCount++;
        console.error(
          `[${i + 1}/${categories.length}] ERROR: ${category.nameEng}`,
          error.message
        );
      }
    }

    console.log("\n========== SUMMARY ==========");
    console.log(`Total: ${categories.length}`);
    console.log(`Created: ${successCount}`);
    console.log(`Failed: ${failureCount}`);
    console.log("=============================");
  } catch (error) {
    console.error("Failed to create categories:", error.message);
    process.exitCode = 1;
  }
}

createCategories();