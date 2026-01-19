import { MqttParams } from "./types/MqttParams";
import { MeasurementData } from "./types/MeasurementData";
import * as mqtt from "mqtt";

export const publishToMqtt = async (measurementData: MeasurementData): Promise<void> => {
  const mqttParams = getMqttParams();
  const client = await connectToMqttBroker(mqttParams);

  try {
    await publishMeasurementData(client, mqttParams.topicPrefix, measurementData);
    console.log(`MQTT: Successfully published measurement data`);
  } finally {
    await disconnectFromMqttBroker(client);
  }
};

const getMqttParams = (): MqttParams => {
  return {
    brokerUrl: process.env.MQTT_BROKER_URL!,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD,
    clientId: process.env.MQTT_CLIENT_ID || `air-quality-monitor-${Date.now()}`,
    topicPrefix: process.env.MQTT_TOPIC_PREFIX || "sensors/air-quality"
  };
};

const connectToMqttBroker = (mqttParams: MqttParams): Promise<mqtt.MqttClient> => {
  return new Promise((resolve, reject) => {
    const options: mqtt.IClientOptions = {
      clientId: mqttParams.clientId,
      username: mqttParams.username,
      password: mqttParams.password,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000
    };

    const client = mqtt.connect(mqttParams.brokerUrl, options);

    client.on("connect", () => {
      resolve(client);
    });

    client.on("error", (error) => {
      reject(error);
    });
  });
};

const disconnectFromMqttBroker = (client: mqtt.MqttClient): Promise<void> => {
  return new Promise((resolve) => {
    client.end(() => {
      resolve();
    });
  });
};

const publishMeasurementData = async (
  client: mqtt.MqttClient,
  topicPrefix: string,
  measurementData: MeasurementData
): Promise<void> => {
  const promises: Promise<void>[] = [];

  // Publish each sensor reading to individual topics
  Object.entries(measurementData).forEach(([key, value]) => {
    const topic = `${topicPrefix}/${camelToSnakeCase(key)}`;
    const payload = JSON.stringify({
      value,
      unit: getSensorUnit(key),
      timestamp: new Date().toISOString()
    });

    promises.push(publishToTopic(client, topic, payload));
  });

  // Publish aggregated data to a summary topic
  const summaryTopic = `${topicPrefix}/summary`;
  const summaryPayload = JSON.stringify({
    ...measurementData,
    timestamp: new Date().toISOString()
  });
  promises.push(publishToTopic(client, summaryTopic, summaryPayload));

  await Promise.all(promises);
};

const publishToTopic = (client: mqtt.MqttClient, topic: string, payload: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    client.publish(topic, payload, { qos: 1 }, (error) => {
      if (error) {
        reject(error);
      } else {
        console.log(`MQTT: Published to ${topic}`);
        resolve();
      }
    });
  });
};

const getSensorUnit = (sensorKey: string): string => {
  const units: { [key: string]: string } = {
    co2Concentration: "ppm",
    bmp280Temperature: "°C",
    scd30Temperature: "°C",
    relativeHumidity: "%",
    meanSeaLevelPressure: "hPa"
  };

  return units[sensorKey] || "";
};

const camelToSnakeCase = (string: string) =>
  string.replace(/[A-Z]/g, (upperCaseLetter) => `_${upperCaseLetter.toLowerCase()}`);
