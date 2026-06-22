-- AlterTable: track how many build steps the development agent has committed.
ALTER TABLE "projects" ADD COLUMN "devStep" INTEGER NOT NULL DEFAULT 0;
