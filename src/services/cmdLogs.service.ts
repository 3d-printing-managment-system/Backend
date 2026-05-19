import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export const createCommandLog = async (data: any) => {
  return prisma.commandLog.create({
    data: {
      printer: {
        connect: { id: data.printer.connect.id },
      },

      ...(data.gcodeCommand?.connect?.id
        ? {
            gcodeCommand: {
              connect: { id: data.gcodeCommand.connect.id },
            },
          }
        : {}),

      rawCommand: data.rawCommand,
      status: data.status,
      response: data.response,
    },
  });
};

export const getCommandLogs = () => {
  return prisma.commandLog.findMany({
    include: { printer: true, gcodeCommand: true },
  });
};

export const getCommandLogById = (id: string) => {
  return prisma.commandLog.findUnique({
    where: { id },
    include: { printer: true, gcodeCommand: true },
  });
};

export const getCommandLogsByPrinter = async (printerId: string) => {
  const printer = await prisma.printer.findUnique({ where: { id: printerId } });
  if (!printer) throw new Error("Printer not found");

  return prisma.commandLog.findMany({
    where: { printerId },
    include: { gcodeCommand: true },
  });
};

export const updateCommandLog = async (
  id: string,
  data: Prisma.CommandLogUpdateInput,
) => {
  const log = await prisma.commandLog.findUnique({ where: { id } });
  if (!log) throw new Error("Command log not found");

  return prisma.commandLog.update({
    where: { id },
    data,
    include: { printer: true, gcodeCommand: true },
  });
};

export const deleteCommandLog = async (id: string) => {
  const log = await prisma.commandLog.findUnique({ where: { id } });
  if (!log) throw new Error("Command log not found");

  return prisma.commandLog.delete({ where: { id } });
};

export const deleteManyCommandLogsService = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("No IDs provided");
  }

  const result = await prisma.commandLog.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return result;
};
