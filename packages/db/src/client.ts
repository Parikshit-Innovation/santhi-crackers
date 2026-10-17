import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(currentDir, "../../../.env") });
config();

import { PrismaClient } from "@prisma/client";

export * from "@prisma/client";
export const db = new PrismaClient();

