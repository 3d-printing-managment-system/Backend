import { Router } from "express";
import * as ctrl from "../controllers/gCodeCmd.controller";

const router = Router();

router.post("/", ctrl.createGcodeCommand);

router.post("/:id/send", ctrl.sendSavedCommandToPrinter);

router.post(
  "/send-raw",
  ctrl.sendRawCommandToPrinter
);

router.get("/", ctrl.getGcodeCommands);

router.delete("/", ctrl.deleteManyGcodeCommands);

router.get("/:id", ctrl.getGcodeCommandById);

router.put("/:id", ctrl.updateGcodeCommand);

router.delete("/:id", ctrl.deleteGcodeCommand);

/**
 * @swagger
 * tags:
 *   name: Gcode Commands
 *   description: Gcode command management
 *
 * /api/gcode-commands:
 *   get:
 *     summary: Get all gcode commands
 *     tags: [Gcode Commands]
 *     responses:
 *       200:
 *         description: List of gcode commands
 *
 *   post:
 *     summary: Create a gcode command
 *     tags: [Gcode Commands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - command
 *             properties:
 *               name:
 *                 type: string
 *                 example: Home All
 *               command:
 *                 type: string
 *                 example: G28
 *     responses:
 *       201:
 *         description: Command created
 *
 *   delete:
 *     summary: Delete multiple gcode commands
 *     tags: [Gcode Commands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Commands deleted
 *
 *
 * /api/gcode-commands/{id}:
 *   get:
 *     summary: Get gcode command by ID
 *     tags: [Gcode Commands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Command found
 *
 *   put:
 *     summary: Update a gcode command
 *     tags: [Gcode Commands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               command:
 *                 type: string
 *     responses:
 *       200:
 *         description: Command updated
 *
 *   delete:
 *     summary: Delete a gcode command
 *     tags: [Gcode Commands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Command deleted
 *
 *
 * /api/gcode-commands/{id}/send:
 *   post:
 *     summary: Send saved gcode command to printer
 *     tags: [Gcode Commands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - printerId
 *             properties:
 *               printerId:
 *                 type: string
 *                 example: printer-uuid-1234
 *     responses:
 *       200:
 *         description: Command sent to printer
 *
 *
 * /api/gcode-commands/send-raw:
 *   post:
 *     summary: Send manual/raw gcode command to printer
 *     tags: [Gcode Commands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - printerId
 *               - gcode
 *             properties:
 *               printerId:
 *                 type: string
 *                 example: printer-uuid-1234
 *               gcode:
 *                 type: string
 *                 example: M104 S200
 *     responses:
 *       200:
 *         description: Raw command sent successfully
 */

export default router;