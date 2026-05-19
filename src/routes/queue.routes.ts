import { Router } from "express";
import * as controller from "../controllers/queue.controller";

const router = Router();

router.post("/process", controller.processQueueController);

export default router;