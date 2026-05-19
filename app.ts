import express from "express";
import cors from "cors";
import printerRoutes from "./src/routes/printer.routes";
import printJobRoutes from "./src/routes/printJob.routes";
import partRoutes from "./src/routes/part.routes";
import tagRoutes from "./src/routes/tag.routes";
import gCodeCmdRoutes from "./src/routes/gCodeCmd.routes";  
import commandLogRouter from "./src/routes/cmdLogs.routes";
import maintenanceLogRouter from "./src/routes/maintenanceLog.routes";
import filamentProfileRoutes from "./src/routes/filamentProfile.routes";
import inventoryRouter from "./src/routes/inventory.routes";
import  printerEventRouter  from "./src/routes/printerEvent.routes";
import queueRoutes from "./src/routes/queue.routes";
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/printers", printerRoutes);
app.use("/api/print-jobs", printJobRoutes);
app.use("/api/parts", partRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/gcode-commands", gCodeCmdRoutes);
app.use("/api/command-logs", commandLogRouter);
app.use("/api/maintenance-logs", maintenanceLogRouter);
app.use("/api/filament-profiles", filamentProfileRoutes);
app.use("/api/inventory", inventoryRouter);
app.use("/api/printer-events", printerEventRouter);
app.use("/api/queue", queueRoutes);

export default app;