import { Router } from "express";
import * as controller from "../controllers/printerEvent.controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Printer Events
 *   description: MQTT + printer communication events tracking
 *
 * /api/events:
 *   post:
 *     summary: Create printer event (used by MQTT or backend simulation)
 *     tags: [Printer Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [printerId, type]
 *             properties:
 *               printerId:
 *                 type: string
 *                 example: "uuid-printer"
 *               jobId:
 *                 type: string
 *                 example: "uuid-job"
 *               type:
 *                 type: string
 *                 example: "PRINT_STARTED"
 *               payload:
 *                 type: object
 *                 example:
 *                   progress: 10
 *                   message: "Job started"
 *     responses:
 *       201:
 *         description: Event created
 */
router.post("/", controller.createEvent);

/**
 * /api/events:
 *   get:
 *     summary: Get all printer events
 *     tags: [Printer Events]
 *     responses:
 *       200:
 *         description: List of events
 */
router.get("/", controller.getAllEvents);

/**
 * /api/events/printer/{printerId}:
 *   get:
 *     summary: Get events by printer
 *     tags: [Printer Events]
 *     parameters:
 *       - in: path
 *         name: printerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Printer events
 */
router.get("/printer/:printerId", controller.getEventsByPrinter);

/**
 * /api/events/job/{jobId}:
 *   get:
 *     summary: Get events by job
 *     tags: [Printer Events]
 *     parameters:
 *       - in: path
 *         name: jobId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job events
 */
router.get("/job/:jobId", controller.getEventsByJob);

export default router;