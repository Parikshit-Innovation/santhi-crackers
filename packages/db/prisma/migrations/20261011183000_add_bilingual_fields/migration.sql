-- AlterTable Category: add bilingual fields and drop not-null on legacy name
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "nameEng" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "nameTam" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "descriptionEng" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "descriptionTam" TEXT;
ALTER TABLE "Category" ALTER COLUMN "name" DROP NOT NULL;
DROP INDEX IF EXISTS "Category_name_key";

-- AlterTable Product: add bilingual fields and drop not-null on legacy fields
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "nameEng" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "nameTam" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "descriptionEng" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "descriptionTam" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "contentEng" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "contentTam" TEXT;
ALTER TABLE "Product" ALTER COLUMN "name" DROP NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "content" DROP NOT NULL;

-- Backfill existing English fields from old name, description, and content fields
UPDATE "Category"
SET 
  "nameEng" = COALESCE("nameEng", "name"),
  "descriptionEng" = COALESCE("descriptionEng", "description")
WHERE "nameEng" IS NULL OR "descriptionEng" IS NULL;

UPDATE "Product"
SET 
  "nameEng" = COALESCE("nameEng", "name"),
  "descriptionEng" = COALESCE("descriptionEng", "description"),
  "contentEng" = COALESCE("contentEng", "content")
WHERE "nameEng" IS NULL OR "descriptionEng" IS NULL OR "contentEng" IS NULL;
