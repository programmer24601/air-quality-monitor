import type { MqttParams } from "./types/MqttParams";
import { camelToSnakeCase } from "./utils/camelToSnakeCase";

export const getSensorConfig = (sensorKey: string, mqttParams: MqttParams) => {
  const snakeCaseKey = camelToSnakeCase(sensorKey);
  const stateTopic = `${mqttParams.topicPrefix}/${mqttParams.deviceId}_${snakeCaseKey}/state`;

  const baseConfig = {
    name: getSensorDisplayName(sensorKey),
    unique_id: `${mqttParams.deviceId}_${snakeCaseKey}`,
    state_topic: stateTopic,
    unit_of_measurement: getSensorUnit(sensorKey),
    device_class: getSensorDeviceClass(sensorKey),
    state_class: "measurement",
    device: {
      identifiers: [mqttParams.deviceId],
      name: mqttParams.deviceName,
      model: "Air Quality Monitor",
      manufacturer: "DIY",
      sw_version: "1.0.0"
    }
  };

  // Add icon for sensors that don't have a device class
  const icon = getSensorIcon(sensorKey);
  if (icon) {
    return { ...baseConfig, icon };
  }

  return baseConfig;
};

const getSensorDisplayName = (sensorKey: string): string => {
  const names: { [key: string]: string } = {
    co2Concentration: "CO₂ Concentration",
    bmp280Temperature: "BMP280 Temperature",
    scd30Temperature: "SCD30 Temperature",
    relativeHumidity: "Humidity",
    meanSeaLevelPressure: "Pressure"
  };

  return names[sensorKey] || sensorKey;
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

const getSensorDeviceClass = (sensorKey: string): string | undefined => {
  const deviceClasses: { [key: string]: string } = {
    co2Concentration: "carbon_dioxide",
    bmp280Temperature: "temperature",
    scd30Temperature: "temperature",
    relativeHumidity: "humidity",
    meanSeaLevelPressure: "pressure"
  };

  return deviceClasses[sensorKey];
};

const getSensorIcon = (sensorKey: string): string | undefined => {
  const icons: { [key: string]: string } = {
    co2Concentration: "mdi:molecule-co2"
  };

  return icons[sensorKey];
};
