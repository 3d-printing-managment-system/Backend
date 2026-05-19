import { Router } from "express";
import * as ctrl from "../controllers/gCodeCmd.controller";

const router = Router();

router.post("/", ctrl.createGcodeCommand);
router.post("/:id/send", ctrl.sendGcodeCommandToPrinter);
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GcodeCommand'
 *   post:
 *     summary: Create a gcode command
 *     tags: [Gcode Commands]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, command]
 *             properties:
 *               name: { type: string, example: "Home All" }
 *               command: { type: string, example: "G28" }
 *     responses:
 *       201:
 *         description: Command created
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
 *                 example: ["uuid1", "uuid2", "uuid3"]
 *     responses:
 *       200:
 *         description: Commands deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deletedCount:
 *                   type: number
 *       400:
 *         description: Bad request
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
 *       404:
 *         description: Command not found
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
 *               name: { type: string }
 *               command: { type: string }
 *     responses:
 *       200:
 *         description: Command updated
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
 * 
* /api/gcode-commands/{id}/send:
 *   post:
 *     summary: Send a gcode command to printer
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
 *                 example: "printer-uuid-1234"
 *     responses:
 *       200:
 *         description: Command sent to printer
 */


export default router;