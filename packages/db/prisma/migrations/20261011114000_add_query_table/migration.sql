-- CreateTable
CREATE TABLE IF NOT EXISTS "Query" (
    "id" TEXT NOT NULL,
    "mobileNumber" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Query_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Query_mobileNumber_idx" ON "Query"("mobileNumber");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Query_createdAt_idx" ON "Query"("createdAt");
