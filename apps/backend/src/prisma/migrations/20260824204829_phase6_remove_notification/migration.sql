/*
  Warnings:

  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "fk_Notification_Parish";

-- DropForeignKey
ALTER TABLE "notification" DROP CONSTRAINT "fk_Notification_Priest";

-- DropTable
DROP TABLE "notification";
