// Single source of the Prisma client for the whole platform.
// Consumers (apps/api) import everything from "@ongo/db" — never from
// "@prisma/client" directly — so the generated client (custom output path)
// resolves correctly across the pnpm workspace.
import { PrismaClient } from "../generated/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error", "warn"]
        : ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Re-export the generated client namespace + all enums/types so callers
// get types and runtime enum values from one place.
export * from "../generated/client";
export { PrismaClient } from "../generated/client";
export default prisma;
