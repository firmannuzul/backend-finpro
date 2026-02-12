/*
  Warnings:

  - You are about to drop the column `test_passing_grade` on the `applications` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "test_passing_grade";

-- AlterTable
ALTER TABLE "job_postings" ADD COLUMN     "test_passing_grade" INTEGER NOT NULL DEFAULT 70;
