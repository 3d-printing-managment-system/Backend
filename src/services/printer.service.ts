import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export const createPrinter = (data: Prisma.PrinterCreateInput) => {
  return prisma.printer.create({ data });
};

export const getPrinters = () => {
  return prisma.printer.findMany({
    include: {
      tags: true,
      jobs: {
        include: {
          part: true,
          profile: true,
        },
      },
    },
  });
};

export const getPrinterById = (id: string) => {
  return prisma.printer.findUnique({
    where: { id },
    include: {
      tags: true,
      jobs: {
        include: {
          part: true,
          profile: true,
        },
      },
      commandLogs: true,
      maintenanceLogs: true,
    },
  });
};

// export const updatePrinter = (id: string, data: Prisma.PrinterUpdateInput) => {
//   return prisma.printer.update({
//     where: { id },
//     data,
//   });
// };
export const updatePrinter = async (id: string, data: any) => {
  const { tags, ...printerData } = data;

  return prisma.$transaction(async (tx) => {
    // 1. update printer WITHOUT tags
    const printer = await tx.printer.update({
      where: { id },
      data: printerData,
    });

    // 2. replace tags manually
    if (Array.isArray(tags)) {
      await tx.printerTag.deleteMany({
        where: { printerId: id },
      });

      await tx.printerTag.createMany({
        data: tags.map((t) => ({
          printerId: id,
          tagId: t.tagId,
        })),
      });
    }

    return tx.printer.findUnique({
      where: { id },
      include: { tags: true },
    });
  });
};

export const deletePrinter = async (id: string) => {
  const printer = await prisma.printer.findUnique({ where: { id } });
  if (!printer) throw new Error("Printer not found");

  await prisma.printJob.deleteMany({ where: { printerId: id } });

  return prisma.printer.delete({ where: { id } });
};

export const deleteManyPrintersService = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("No IDs provided");
  }

  await prisma.printJob.deleteMany({
    where: {
      printerId: {
        in: ids,
      },
    },
  });

  await prisma.commandLog.deleteMany({
    where: {
      printerId: {
        in: ids,
      },
    },
  });

  await prisma.maintenanceLog.deleteMany({
    where: {
      printerId: {
        in: ids,
      },
    },
  });

  await prisma.printerTag.deleteMany({
    where: {
      printerId: {
        in: ids,
      },
    },
  });

  const result = await prisma.printer.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return result;
};