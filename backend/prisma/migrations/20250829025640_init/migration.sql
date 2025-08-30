/*
  Warnings:

  - Made the column `description` on table `Todo` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "public"."Todo" ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "password" SET NOT NULL;
