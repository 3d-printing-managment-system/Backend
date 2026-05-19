import { prisma } from "../../lib/prisma";
import { publishStartJob } from "./mqtt.service";

/**
 * =========================================================
 * QUEUE PROCESSOR
 * =========================================================
 * Called when:
 * - a new job is created
 * - a printer becomes IDLE
 * - a job finishes/fails/cancels
 * =========================================================
 */

export const processQueue = async () => {
  // ======================================================
  // GET IDLE PRINTERS
  // ======================================================

  const printers = await prisma.printer.findMany({
    include: {
      tags: true,
    },
  });

  const idlePrinters = printers.filter(
    (printer) => printer.status === "IDLE"
  );

  if (idlePrinters.length === 0) {
    return "No idle printers available";
  }

  // ======================================================
  // GET QUEUED JOBS
  // ======================================================

  const jobs = await prisma.printJob.findMany({
    where: {
      status: "QUEUED",
    },
    orderBy: {
      queuePosition: "asc",
    },
    include: {
      part: true,
    },
  });

  if (jobs.length === 0) {
    return "No queued jobs";
  }

  // ======================================================
  // PRIORITY SPLIT
  // ======================================================

  const specificPrinterJobs = jobs.filter(
    (job) => job.printerSelectionMode === "SPECIFIC_PRINTER"
  );

  const tagBasedJobs = jobs.filter(
    (job) =>
      job.printerSelectionMode ===
      "NEXT_AVAILABLE_WITH_SPECIFIC_TAG"
  );

  // ======================================================
  // STEP 1
  // HANDLE SPECIFIC PRINTER JOBS FIRST
  // ======================================================

  await handleSpecificPrinterJobs(
    specificPrinterJobs,
    idlePrinters
  );

  // ======================================================
  // REFRESH PRINTER STATES
  // ======================================================

  const refreshedPrinters = await prisma.printer.findMany({
    include: {
      tags: true,
    },
  });

  const refreshedIdlePrinters = refreshedPrinters.filter(
    (printer) => printer.status === "IDLE"
  );

  // ======================================================
  // STEP 2
  // HANDLE TAG BASED JOBS
  // ======================================================

  await handleTagBasedJobs(
    tagBasedJobs,
    refreshedIdlePrinters
  );

  return "Queue processed successfully";
};

/**
 * =========================================================
 * HANDLE SPECIFIC PRINTER JOBS
 * =========================================================
 */

const handleSpecificPrinterJobs = async (
  jobs: any[],
  idlePrinters: any[]
) => {
  for (const job of jobs) {
    if (idlePrinters.length === 0) {
      return;
    }

    if (!job.printerId) {
      continue;
    }

    // find the exact requested printer
    const printer = idlePrinters.find(
      (printer) => printer.id === job.printerId
    );

    // printer not idle/available
    if (!printer) {
      continue;
    }

    // assign
    await assignJobToPrinter(job, printer);

    // remove printer from local idle list
    const index = idlePrinters.findIndex(
      (p) => p.id === printer.id
    );

    if (index !== -1) {
      idlePrinters.splice(index, 1);
    }
  }
};

/**
 * =========================================================
 * HANDLE TAG BASED JOBS
 * =========================================================
 */

const handleTagBasedJobs = async (
  jobs: any[],
  idlePrinters: any[]
) => {
  for (const job of jobs) {
    if (idlePrinters.length === 0) {
      return;
    }

    const requiredTags = job.requiredTagIds || [];

    // find first printer containing one of the tags
    const printer = idlePrinters.find((printer) =>
      printer.tags.some((tag: any) =>
        requiredTags.includes(tag.tagId)
      )
    );

    // no compatible printer available
    if (!printer) {
      continue;
    }

    // assign
    await assignJobToPrinter(job, printer);

    // remove printer from local idle list
    const index = idlePrinters.findIndex(
      (p) => p.id === printer.id
    );

    if (index !== -1) {
      idlePrinters.splice(index, 1);
    }
  }
};

/**
 * =========================================================
 * ASSIGN JOB TO PRINTER
 * =========================================================
 * FLOW:
 * 1. reserve printer
 * 2. mark job as DISPATCHED
 * 3. send MQTT message to PI
 * 4. log printer event
 * =========================================================
 */

const assignJobToPrinter = async (
  job: any,
  printer: any
) => {
  // ======================================================
  // DB TRANSACTION
  // prevents race conditions
  // ======================================================

  await prisma.$transaction([
    prisma.printer.update({
      where: {
        id: printer.id,
      },
      data: {
        status: "RESERVED",
      },
    }),

    prisma.printJob.update({
      where: {
        id: job.id,
      },
      data: {
        printerId: printer.id,
        status: "DISPATCHED",
      },
    }),
  ]);

  // ======================================================
  // MQTT DISPATCH
  // ======================================================

 await publishStartJob({
  printerId: printer.id,
  jobId: job.id,
  fileUrl: job.part.fileUrl!,
});

  // ======================================================
  // EVENT LOGGING
  // ======================================================

  await prisma.printerEvent.create({
    data: {
      printerId: printer.id,

      jobId: job.id,

      type: "JOB_DISPATCHED",

      payload: {
        fileUrl: job.part.fileUrl,
      },
    },
  });
};