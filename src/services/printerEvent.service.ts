import { prisma } from "../../lib/prisma";

export const logPrinterEvent = async (data: {
  printerId: string;
  jobId?: string;
  type: string
  payload: any;
}) => {
  return prisma.printerEvent.create({
    data: {
      printerId: data.printerId,
      jobId: data.jobId,
      type: data.type || "UNKNOWN_EVENT",
      payload: data.payload ?? {},
    },
  });
};

export const getAllEvents = async () => {
  return prisma.printerEvent.findMany({
    orderBy: { createdAt: "desc" },
  });
};

export const getEventsByPrinter = async (printerId: string) => {
  return prisma.printerEvent.findMany({
    where: { printerId },
    orderBy: { createdAt: "desc" },
  });
};

export const getEventsByJob = async (jobId: string) => {
  return prisma.printerEvent.findMany({
    where: { jobId },
    orderBy: { createdAt: "desc" },
  });
};