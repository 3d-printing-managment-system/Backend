import mqtt from "mqtt";
import { prisma } from "../../lib/prisma";

const brokerUrl = process.env.MQTT_BROKER_URL as string;

const client = mqtt.connect(brokerUrl, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  keepalive: 60,
  clean: false,
  clientId: `backend-${Math.random().toString(16).slice(2)}`,
});

client.on("connect", () => {
  console.log("✅ MQTT listener connected");

  // subscribe to ALL pi messages
  client.subscribe("printers/+/printer-state");
  client.subscribe("printers/+/jobs/job-state");
  client.subscribe("printers/+/handshake");

  console.log("📡 Subscribed to printer topics");
});

client.on("message", async (topic, message) => {
  try {
    const data = JSON.parse(message.toString());

    console.log("📩 topic:", topic);
    console.log("📩 data:", data);

    // ======================================================
    // 1. HANDSHAKE
    // ======================================================
    if (topic.includes("/handshake")) {
      await prisma.printer.upsert({
        where: { id: data.printerId },
        update: {
          name: data.name,
          model: data.model,
          nozzleDiameter: data.nozzleDiameter,
          status: "IDLE",
        },
        create: {
          id: data.printerId,
          name: data.name,
          model: data.model,
          nozzleDiameter: data.nozzleDiameter,
          ipAddress: "",
          status: "IDLE",
          nozzleTemp: 0,
          bedTemp: 0,
          cameraLink: "",
          printerType: "UNKNOWN",
        },
      });

      return;
    }

    // ======================================================
    // 2. PRINTER STATE
    // ======================================================
    if (topic.includes("/printer-state")) {
      await prisma.printer.update({
        where: { id: data.printerId },
        data: {
          status: data.status ? data.status.toUpperCase() : "UNKNOWN",
          nozzleDiameter: data.nozzleDiameter,
          nozzleTemp: data.nozzleTemp,
          bedTemp: data.bedTemp,
        },
      });

      return;
    }

    // ======================================================
    // 3. JOB STATE
    // ======================================================
    if (topic.includes("/jobs/job-state")) {
      const statusMap: any = {
        queued: "QUEUED",
        running: "PRINTING",
        paused: "PAUSED",
        completed: "DONE",
        failed: "FAILED",
      };

      await prisma.printJob.update({
        where: { id: data.jobId },
        data: {
          status: statusMap[data.status] ?? "QUEUED",
          progress: Math.round((data.progress || 0) * 100),
          startedAt: data.startedAt ? new Date(data.startedAt) : undefined,
          finishedAt: data.finishedAt ? new Date(data.finishedAt) : undefined,
        },
      });

      return;
    }
  } catch (err) {
    console.error("❌ MQTT ERROR:", err);
  }
});

export default client;