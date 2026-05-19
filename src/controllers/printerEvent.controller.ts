import { RequestHandler } from "express";
import * as service from "../services/printerEvent.service";

type IdParam = { id: string };
type PrinterParam = { printerId: string };
type JobParam = { jobId: string };

const handleError = (res: any, error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Internal server error";

  const status =
    message.includes("not found") ? 404 :
    message.includes("required") || message.includes("must") ? 400 :
    500;

  return res.status(status).json({ error: message });
};

/**
 * CREATE EVENT (MQTT or manual debug)
 */
export const createEvent: RequestHandler = async (req, res) => {
  try {
    const data = await service.logPrinterEvent(req.body);
    return res.status(201).json(data);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * GET ALL EVENTS
 */
export const getAllEvents: RequestHandler = async (_req, res) => {
  try {
    const data = await service.getAllEvents();
    return res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * GET EVENTS BY PRINTER
 */
export const getEventsByPrinter: RequestHandler<PrinterParam> = async (req, res) => {
  try {
    const data = await service.getEventsByPrinter(req.params.printerId);
    return res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};

/**
 * GET EVENTS BY JOB
 */
export const getEventsByJob: RequestHandler<JobParam> = async (req, res) => {
  try {
    const data = await service.getEventsByJob(req.params.jobId);
    return res.json(data);
  } catch (error) {
    handleError(res, error);
  }
};