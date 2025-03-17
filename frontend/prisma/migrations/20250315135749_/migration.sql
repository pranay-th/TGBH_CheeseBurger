/*
  Warnings:

  - Changed the type of `answers` on the `ExamSubmission` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "EventLog" ADD COLUMN     "isCheating" BOOLEAN,
ADD COLUMN     "riskScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "ExamSubmission" ADD COLUMN     "isCheating" BOOLEAN,
ADD COLUMN     "riskScore" DOUBLE PRECISION,
DROP COLUMN "answers",
ADD COLUMN     "answers" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Keystroke" ADD COLUMN     "isCheating" BOOLEAN,
ADD COLUMN     "riskScore" DOUBLE PRECISION,
ADD COLUMN     "typingPattern" TEXT,
ADD COLUMN     "typingSpeed" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "MouseMovement" ADD COLUMN     "isCheating" BOOLEAN,
ADD COLUMN     "movementType" TEXT,
ADD COLUMN     "riskScore" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "TabSwitch" ADD COLUMN     "isCheating" BOOLEAN,
ADD COLUMN     "riskScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "AnomalyDetection" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featureSet" JSONB NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "isCheating" BOOLEAN NOT NULL,

    CONSTRAINT "AnomalyDetection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AnomalyDetection" ADD CONSTRAINT "AnomalyDetection_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
