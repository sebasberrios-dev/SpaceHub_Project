/*
  Warnings:

  - The `plan` column on the `Membership` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "plan",
ADD COLUMN     "plan" "MembershipPlan" NOT NULL DEFAULT 'basic';
