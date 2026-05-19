import { RequestHandler } from "express";
import * as queueService from "../services/queue.service";

const handleError = (res: any, error: unknown) => {
  const message =
    error instanceof Error ? error.message : "Internal server error";

  const status =
    message.includes("not found") ? 404 :
    message.includes("required") || message.includes("must") ? 400 :
    500;

  return res.status(status).json({ error: message });
};

export const processQueueController: RequestHandler = async (
  _req,
  res
) => {
  try {
    const result = await queueService.processQueue();

    return res.status(200).json({
      success: true,
      message: result,
    });
  } catch (error) {
    handleError(res, error);
  }
};