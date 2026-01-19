import { MqttParams } from "./types/MqttParams";
import { MeasurementData } from "./types/MeasurementData";
import * as mqtt from "mqtt";
import { getSensorConfig } from "./getSensorConfig";
import { camelToSnakeCase } from "./utils/camelToSnakeCase";

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
    topicPrefix: process.env.MQTT_TOPIC_PREFIX || "homeassistant/sensor",
    deviceName: process.env.MQTT_DEVICE_NAME || "Air Quality Monitor",
    deviceId: process.env.MQTT_DEVICE_ID || "air_quality_monitor_01",
    enableHomeAssistantDiscovery: process.env.MQTT_ENABLE_HA_DISCOVERY !== "false"
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
  const mqttParams = getMqttParams();
  const promises: Promise<void>[] = [];

  // Publish Home Assistant discovery configurations if enabled
  if (mqttParams.enableHomeAssistantDiscovery) {
    Object.entries(measurementData).forEach(([key]) => {
      promises.push(publishHomeAssistantDiscovery(client, mqttParams, key));
    });
  }

  // Publish each sensor reading to Home Assistant friendly state topics
  Object.entries(measurementData).forEach(([key, value]) => {
    const stateTopic = `${topicPrefix}/${mqttParams.deviceId}_${camelToSnakeCase(key)}/state`;
    promises.push(publishToTopic(client, stateTopic, (value as number).toString()));
  });

  await Promise.all(promises);
};

const publishHomeAssistantDiscovery = async (
  client: mqtt.MqttClient,
  mqttParams: MqttParams,
  sensorKey: string
): Promise<void> => {
  const sensorConfig = getSensorConfig(sensorKey, mqttParams);
  const discoveryTopic = `${mqttParams.topicPrefix}/${mqttParams.deviceId}_${camelToSnakeCase(sensorKey)}/config`;
  const discoveryPayload = JSON.stringify(sensorConfig);

  return publishToTopic(client, discoveryTopic, discoveryPayload);
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
