import mqtt from "mqtt";


const client = mqtt.connect(process.env.MQTT_BROKER_URL!, {
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  keepalive: 60,
  clean: false,
  clientId: `backend-listener-${Math.random().toString(16).substring(2, 8)}`,

});

client.on("connect", () => {
  console.log("✅ MQTT publisher connected");
});

client.on("error", (err) => {
  console.error("❌ MQTT error:", err);
});

//start job 

export const publishStartJob = ({
  printerId,
  jobId,
  fileUrl,
}: {
  printerId: string;
  jobId: string;
  fileUrl: string;
}) => {
  const topic = `printers/${printerId}/start-job`;

  const payload = {
    printerId,
    jobId,
    commandName: "START_JOB",
    fileUrl,
  };

  client.publish(topic, JSON.stringify(payload), {
    qos: 1,
  });

  console.log("📤 START_JOB SENT:", payload);
};

//printer commands 

export const publishPrinterCommand = ({
  printerId,
  commandName,
  gcode,
}: {
  printerId: string;
  commandName: string;
  gcode: string;
}) => {
  const topic = `printers/${printerId}/commands`;

  const payload = {
    printerId,
    commandName,
    gcode,
  };

  client.publish(topic, JSON.stringify(payload), {
    qos: 1,
  });

  console.log("📤 COMMAND SENT:", payload);
};

export default client;