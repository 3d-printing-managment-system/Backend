import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export const createFilamentProfile = (
  data: Prisma.FilamentProfileCreateInput,
) => {
  return prisma.filamentProfile.create({
    data,
    include: { inventory: true, printJob: true },
  });
};

export const getFilamentProfiles = () => {
  return prisma.filamentProfile.findMany({
    include: { inventory: true, printJob: true },
  });
};

export const getFilamentProfileById = (id: string) => {
  return prisma.filamentProfile.findUnique({
    where: { id },
    include: { inventory: true, printJob: true },
  });
};

export const updateFilamentProfile = async (
  id: string,
  data: Prisma.FilamentProfileUpdateInput,
) => {
  const profile = await prisma.filamentProfile.findUnique({ where: { id } });
  if (!profile) throw new Error("Filament profile not found");

  return prisma.filamentProfile.update({
    where: { id },
    data,
    include: { inventory: true, printJob: true },
  });
};

export const deleteFilamentProfile = async (id: string) => {
  const profile = await prisma.filamentProfile.findUnique({ where: { id } });
  if (!profile) throw new Error("Filament profile not found");

  await prisma.inventory.deleteMany({ where: { profileId: id } });

  return prisma.filamentProfile.delete({ where: { id } });
};

export const deleteManyFilamentProfilesService = async (ids: string[]) => {
  if (!ids || ids.length === 0) {
    throw new Error("No IDs provided");
  }

  await prisma.inventory.deleteMany({
    where: {
      profileId: {
        in: ids,
      },
    },
  });

  const result = await prisma.filamentProfile.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  return result;
};
