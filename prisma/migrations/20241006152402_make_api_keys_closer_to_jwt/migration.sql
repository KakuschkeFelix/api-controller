/*
  Warnings:

  - You are about to drop the column `expiresAt` on the `ApiKey` table. All the data in the column will be lost.
  - Added the required column `expiresIn` to the `ApiKey` table without a default value. This is not possible if the table is not empty.
  - Added the required column `issuedAt` to the `ApiKey` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ApiKey" DROP COLUMN "expiresAt",
ADD COLUMN     "expiresIn" INTEGER NOT NULL,
ADD COLUMN     "issuedAt" TIMESTAMP(3) NOT NULL;
