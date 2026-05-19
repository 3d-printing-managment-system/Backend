import app from "./app";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";
import express from "express";
import cors from "cors";
import "./src/services/mqtt.listener"; // Start MQTT listener on server startup

const PORT = process.env.PORT || 3000;

// 👇 PUT IT HERE (after app is created, before routes)
app.use("/uploads", express.static("uploads"));
app.use(
  cors({
    origin: "*", // later you can restrict to your frontend URL
  }),
);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customSiteTitle: "3D Printing API Docs",
  }),
);

app.listen(PORT, () => {
  console.log("BROKER URL =", process.env.MQTT_BROKER_URL);
  console.log(`Server running on port ${PORT}`);
});
app.get("/", (req, res) => {
  res.send("3D Printing Backend API");
});
