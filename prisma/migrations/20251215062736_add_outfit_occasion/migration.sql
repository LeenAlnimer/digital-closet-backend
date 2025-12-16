-- CreateEnum
CREATE TYPE "OccasionType" AS ENUM ('WORK', 'CASUAL', 'FORMAL', 'PARTY', 'DATE', 'SPORT', 'TRAVEL');

-- AlterTable
ALTER TABLE "Outfit" ADD COLUMN     "occasion" "OccasionType";
