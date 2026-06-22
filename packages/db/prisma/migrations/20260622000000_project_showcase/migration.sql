-- AlterTable: public showcase fields on projects + GitHub repo sync metadata.
-- Additive only; safe to apply over existing data.
ALTER TABLE "projects" ADD COLUMN "tagline" TEXT,
ADD COLUMN "liveUrl" TEXT,
ADD COLUMN "imageUrl" TEXT,
ADD COLUMN "tech" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "stars" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "source" TEXT NOT NULL DEFAULT 'manual',
ADD COLUMN "pushedAt" TIMESTAMP(3),
ADD COLUMN "lastSyncedAt" TIMESTAMP(3);

-- CreateIndex: the public showcase query filters on featured.
CREATE INDEX "projects_featured_idx" ON "projects"("featured");
