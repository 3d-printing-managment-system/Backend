import { RequestHandler } from "express";
import * as service from "../services/gCodeCmd.service";

type IdParam = { id: string };

const handleError = (res: any, error: unknown) => {
  const message = error instanceof Error ? error.message : "Internal server error";
  const status =
    message.includes("not found") ? 404 :
    message.includes("Invalid") || message.includes("must") ? 400 :
    500;
  res.status(status).json({ error: message });
};

export const createGcodeCommand: RequestHandler = async (req, res) => {
  try {
    const data = await service.createGcodeCommand(req.body);
    res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getGcodeCommands: RequestHandler = async (_req, res) => {
  try {
    const data = await service.getGcodeCommands();
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const getGcodeCommandById: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.getGcodeCommandById(req.params.id);
    if (!data) return res.status(404).json({ error: "Gcode command not found" });
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const updateGcodeCommand: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.updateGcodeCommand(req.params.id, req.body);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteGcodeCommand: RequestHandler<IdParam> = async (req, res) => {
  try {
    const data = await service.deleteGcodeCommand(req.params.id);
    res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

export const deleteManyGcodeCommands: RequestHandler = async (req, res) => {
  try {
    const { ids } = req.body;

    const result = await service.deleteManyGcodeCommandsService(ids);

    return res.status(200).json({
      message: "Gcode commands deleted successfully",
      deletedCount: result.count,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message,
    });
  }
};


export const sendSavedCommandToPrinter: RequestHandler<IdParam> =
  async (req, res) => {
    try {
      const printerId = req.query.printerId as string;

      if (!printerId) {
        return res.status(400).json({
          error: "printerId query parameter is required",
        });
      }

      const result =
        await service.sendSavedCommandToPrinter({
          printerId,
          gcodeCommandId: req.params.id,
        });

      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  };

  export const sendRawCommandToPrinter: RequestHandler =
  async (req, res) => {
    try {
      const { printerId, gcode } = req.body;

      if (!printerId || !gcode) {
        return res.status(400).json({
          error: "printerId and gcode are required",
        });
      }

      const result =
        await service.sendRawCommandToPrinter({
          printerId,
          gcode,
        });

      res.json(result);
    } catch (error) {
      handleError(res, error);
    }
  };
  