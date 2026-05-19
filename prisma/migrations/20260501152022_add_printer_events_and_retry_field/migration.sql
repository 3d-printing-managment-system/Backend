-- AlterEnum
ALTER TYPE "JobStatus" ADD VALUE 'DISPATCHED';

-- AlterEnum
ALTER TYPE "PrinterStatus" ADD VALUE 'RESERVED';

-- AlterTable
ALTER TABLE "PrintJob" ADD COLUMN     "retryCount" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "PrinterEvent" (
    "id" TEXT NOT NULL,
    "printerId" TEXT NOT NULL,
    "jobId" TEXT,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PrinterEvent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PrinterEvent" ADD CONSTRAINT "PrinterEvent_printerId_fkey" FOREIGN KEY ("printerId") REFERENCES "Printer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
