import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { publishPrinterCommand } from "./mqtt.service";

export const createGcodeCommand = (data: Prisma.GcodeCommandCreateInput) => {
  return prisma.gcodeCommand.create({ data });
};

export const getGcodeCommands = () => {
  return prisma.gcodeCommand.findMany({
    include: { commandLogs: true },
  });
};

export const getGcodeCommandById = (id: string) => {
  return prisma.gcodeCommand.findUnique({
    where: { id },
    include: { commandLogs: true },
  });
};

export const updateGcodeCommand = async (id: string, data: Prisma.GcodeCommandUpdateInput) => {
  const command = await prisma.gcodeCommand.findUnique({ where: { id } });
  if (!command) throw new Error("Gcode command not found");

  return prisma.gcodeCommand.update({
    where: { id },
    data,
    include: { commandLogs: true },
  });
};

export const deleteGcodeCommand = async (id: string) => {
  const command = await prisma.gcodeCommand.findUnique({ where: { id } });
  if (!command) throw new Error("Gcode command not found");

  return prisma.gcodeCommand.delete({ where: { id } });
};

export const deleteManyGcodeCommandsService = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("No IDs provided");
  }

  const result = await prisma.gcodeCommand.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return result;
};


export const sendSavedCommandToPrinter = async ({
  printerId,
  gcodeCommandId,
}: {
  printerId: string;
  gcodeCommandId: string;
}) => {
  const command = await prisma.gcodeCommand.findUnique({
    where: { id: gcodeCommandId },
  });

  if (!command) {
    throw new Error("Gcode command not found");
  }

  publishPrinterCommand({
    printerId,
    commandName: command.name,
    gcode: command.command,
  });

  await prisma.commandLog.create({
    data: {
      printerId,
      commandId: command.id,
      rawCommand: command.command,
      status: "SENT",
    },
  });

  return {
    success: true,
  };
};

export const sendRawCommandToPrinter = async ({
  printerId,
  gcode,
}: {
  printerId: string;
  gcode: string;
}) => {

  publishPrinterCommand({
    printerId,
    commandName: "MANUAL_COMMAND",
    gcode,
  });

  await prisma.commandLog.create({
    data: {
      printerId,
      rawCommand: gcode,
      status: "SENT",
    },
  });

  return {
    success: true,
  };
};