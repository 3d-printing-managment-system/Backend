import { prisma } from "../../lib/prisma";

interface CreatePrintJobInput {
  fileId: string;

  // Only required for SPECIFIC_PRINTER
  printerId?: string | null;

  profileId?: string | null;

  printerSelectionMode: "NEXT_AVAILABLE_WITH_SPECIFIC_TAG" | "SPECIFIC_PRINTER";

  // Used only for NEXT_AVAILABLE_WITH_SPECIFIC_TAG
  requiredTagIds?: string[];

  estimatedTime?: number | null;

  createdAt?: string;

  queuePosition?: number;

  [key: string]: unknown;
}
export const createPrintJob = async (data: CreatePrintJobInput) => {
  // Validate file
  const part = await prisma.part.findUnique({
    where: { id: data.fileId },
  });

  if (!part) {
    throw new Error("Part not found");
  }

  // SPECIFIC_PRINTER mode → must have printer
  if (data.printerSelectionMode === "SPECIFIC_PRINTER") {
    if (!data.printerId) {
      throw new Error("Printer is required in SPECIFIC_PRINTER mode");
    }

    const printer = await prisma.printer.findUnique({
      where: { id: data.printerId },
    });

    if (!printer) {
      throw new Error("Printer not found");
    }
  }

  // NEXT_AVAILABLE_WITH_SPECIFIC_TAG → must have tags
  if (data.printerSelectionMode === "NEXT_AVAILABLE_WITH_SPECIFIC_TAG") {
    if (!data.requiredTagIds || data.requiredTagIds.length === 0) {
      throw new Error("At least one tag is required");
    }
  }

  return prisma.printJob.create({
    data: {
      fileId: data.fileId,

      // RULE:
      // SPECIFIC_PRINTER → set printer
      // NEXT_AVAILABLE → null
      printerId:
        data.printerSelectionMode === "SPECIFIC_PRINTER"
          ? data.printerId
          : null,

      profileId: data.profileId ?? null,

      printerSelectionMode: data.printerSelectionMode,

      estimatedTime: data.estimatedTime ?? null,

      createdAt: new Date(),

      queuePosition: data.queuePosition ?? 0,

      status: "QUEUED",
      progress: 0,
      startedAt: null,
      finishedAt: null,

      // ✅ JUST STORE IDS (NO CONNECT)
      requiredTagIds:
        data.printerSelectionMode === "NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
          ? (data.requiredTagIds ?? [])
          : [],
    },
  });
};

export const getPrintJobs = () => {
  return prisma.printJob.findMany({
    orderBy: {
      queuePosition: "asc",
    },
    include: {
      printer: true,
      part: true,
      profile: true,
    },
  });
};

export const getPrintJobById = (id: string) => {
  return prisma.printJob.findUnique({
    where: { id },
    include: { printer: true, part: true, profiles: true },
  });
};

export const startPrintJob = async (id: string) => {
  const job = await prisma.printJob.findUnique({ where: { id } });
  if (!job) throw new Error("Job not found");
  if (job.status !== "QUEUED")
    throw new Error("Only queued jobs can be started");
if (!job.printerId) throw new Error("Cannot start a job without an assigned printer");

  await prisma.printer.update({
    where: { id: job.printerId },
    data: { status: "PRINTING" },
  });

  return prisma.printJob.update({
    where: { id },
    data: { status: "PRINTING", startedAt: new Date() },
  });
};

export const updateProgress = async (id: string, progress: number) => {
  if (progress < 0 || progress > 100) {
    throw new Error("Progress must be between 0 and 100");
  }

  const job = await prisma.printJob.findUnique({ where: { id } });
  if (!job) throw new Error("Job not found");
  if (job.status !== "PRINTING")
    throw new Error("Job is not currently printing");

  const isDone = progress === 100;
if (!job.printerId) throw new Error("Cannot start a job without an assigned printer");
  if (isDone) {
    await prisma.printer.update({
      where: { id: job.printerId },
      data: { status: "IDLE" },
    });
  }

  return prisma.printJob.update({
    where: { id },
    data: {
      progress,
      status: isDone ? "DONE" : "PRINTING",
      finishedAt: isDone ? new Date() : undefined,
    },
  });
};

export const pauseJob = async (id: string) => {
  const job = await prisma.printJob.findUnique({ where: { id } });
  if (!job) throw new Error("Job not found");
  if (job.status !== "PRINTING")
    throw new Error("Only printing jobs can be paused");
if (!job.printerId) throw new Error("Cannot start a job without an assigned printer");

  await prisma.printer.update({
    where: { id: job.printerId },
    data: { status: "PAUSED" },
  });

  return prisma.printJob.update({
    where: { id },
    data: { status: "PAUSED" },
  });
};

export const resumeJob = async (id: string) => {
  const job = await prisma.printJob.findUnique({ where: { id } });
  if (!job) throw new Error("Job not found");
  if (job.status !== "PAUSED")
    throw new Error("Only paused jobs can be resumed");
if (!job.printerId) throw new Error("Cannot start a job without an assigned printer");

  await prisma.printer.update({
    where: { id: job.printerId },
    data: { status: "PRINTING" },
  });

  return prisma.printJob.update({
    where: { id },
    data: { status: "PRINTING" },
  });
};

export const cancelJob = async (id: string) => {
  const job = await prisma.printJob.findUnique({ where: { id } });
  if (!job) throw new Error("Job not found");

  const cancellableStatuses = ["QUEUED", "PRINTING", "PAUSED"];
  if (!cancellableStatuses.includes(job.status)) {
    throw new Error("Job cannot be cancelled in its current state");
  }
if (!job.printerId) throw new Error("Cannot start a job without an assigned printer");
  await prisma.printer.update({
    where: { id: job.printerId },
    data: { status: "IDLE" },
  });

  return prisma.printJob.update({
    where: { id },
    data: { status: "CANCELLED", finishedAt: new Date() },
  });
};

export const failJob = async (id: string) => {
  const job = await prisma.printJob.findUnique({ where: { id } });
  if (!job) throw new Error("Job not found");
if (!job.printerId) throw new Error("Cannot start a job without an assigned printer");
  await prisma.printer.update({
    where: { id: job.printerId },
    data: { status: "IDLE" },
  });

  return prisma.printJob.update({
    where: { id },
    data: { status: "FAILED", finishedAt: new Date() },
  });
};

export const deletePrintJob = (id: string) => {
  return prisma.printJob.delete({ where: { id } });
};

export const deleteManyPrintJobsService = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("No IDs provided");
  }

  const result = await prisma.printJob.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return result;
};