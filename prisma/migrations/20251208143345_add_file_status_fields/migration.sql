-- AlterTable
ALTER TABLE "files" ADD COLUMN     "error" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'PENDING',
ADD COLUMN     "url" TEXT,
ALTER COLUMN "filepath" SET DEFAULT '';
