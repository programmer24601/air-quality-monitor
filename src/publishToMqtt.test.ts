import { MeasurementData } from "./types/MeasurementData";
import { publishToMqtt } from "./publishToMqtt";
import * as mqtt from "mqtt";
import { mocked } from "jest-mock";

jest.mock("mqtt");

describe("publishToMqtt", () => {
  const mockClient = {
    publish: jest.fn(),
    end: jest.fn(),
    on: jest.fn()
  } as unknown as mqtt.MqttClient;

  const mockConnect = mocked(mqtt.connect);

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful connection
    mockConnect.mockReturnValue(mockClient);

    // Mock client events
    (mockClient.on as jest.Mock).mockImplementation((event: string, callback: Function) => {
      if (event === "connect") {
        setTimeout(callback, 0);
      }
      return mockClient;
    });

    // Mock successful publish
    (mockClient.publish as jest.Mock).mockImplementation((_topic, _payload, _options, callback) => {
      setTimeout(() => callback(), 0);
      return mockClient;
    });

    // Mock successful disconnect
    (mockClient.end as jest.Mock).mockImplementation((callback) => {
      setTimeout(callback, 0);
      return mockClient;
    });

    // Mock environment variables
    process.env.MQTT_BROKER_URL = "mqtt://localhost:1883";
    process.env.MQTT_USERNAME = "testuser";
    process.env.MQTT_PASSWORD = "testpass";
    process.env.MQTT_CLIENT_ID = "test-client";
    process.env.MQTT_TOPIC_PREFIX = "homeassistant/sensor";
    process.env.MQTT_DEVICE_NAME = "Test Device";
    process.env.MQTT_DEVICE_ID = "test_device_01";
    process.env.MQTT_ENABLE_HA_DISCOVERY = "true";
  });

  afterEach(() => {
    delete process.env.MQTT_BROKER_URL;
    delete process.env.MQTT_USERNAME;
    delete process.env.MQTT_PASSWORD;
    delete process.env.MQTT_CLIENT_ID;
    delete process.env.MQTT_TOPIC_PREFIX;
    delete process.env.MQTT_DEVICE_NAME;
    delete process.env.MQTT_DEVICE_ID;
    delete process.env.MQTT_ENABLE_HA_DISCOVERY;
  });

  it("should connect to MQTT broker with correct parameters", async () => {
    const measurementData: MeasurementData = {
      co2Concentration: 900,
      relativeHumidity: 45,
      scd30Temperature: 20,
      bmp280Temperature: 19,
      meanSeaLevelPressure: 1030
    };

    await publishToMqtt(measurementData);

    expect(mockConnect).toHaveBeenCalledWith("mqtt://localhost:1883", {
      clientId: "test-client",
      username: "testuser",
      password: "testpass",
      reconnectPeriod: 1000,
      connectTimeout: 30000
    });
  });

  it("should publish Home Assistant discovery configs and state topics", async () => {
    const measurementData: MeasurementData = {
      co2Concentration: 900,
      relativeHumidity: 45,
      scd30Temperature: 20,
      bmp280Temperature: 19,
      meanSeaLevelPressure: 1030
    };

    await publishToMqtt(measurementData);

    // Should publish discovery configs (5) + state topics (5) = 10 total
    expect(mockClient.publish).toHaveBeenCalledTimes(10);

    // Check discovery topics
    expect(mockClient.publish).toHaveBeenCalledWith(
      "homeassistant/sensor/test_device_01_co2_concentration/config",
      expect.stringContaining('"device_class":"carbon_dioxide"'),
      { qos: 1 },
      expect.any(Function)
    );

    // Check state topics
    expect(mockClient.publish).toHaveBeenCalledWith(
      "homeassistant/sensor/test_device_01_co2_concentration/state",
      "900",
      { qos: 1 },
      expect.any(Function)
    );
    
    expect(mockClient.publish).toHaveBeenCalledWith(
      "homeassistant/sensor/test_device_01_relative_humidity/state",
      "45",
      { qos: 1 },
      expect.any(Function)
    );
  });

  it("should include Home Assistant device information in discovery config", async () => {
    const measurementData: MeasurementData = {
      co2Concentration: 900,
      relativeHumidity: 45,
      scd30Temperature: 20,
      bmp280Temperature: 19,
      meanSeaLevelPressure: 1030
    };

    await publishToMqtt(measurementData);

    // Get a discovery config call and parse it
    const discoveryCall = (mockClient.publish as jest.Mock).mock.calls.find(
      (call) => call[0].includes("/config")
    );
    const config = JSON.parse(discoveryCall[1]);

    expect(config).toMatchObject({
      device: {
        identifiers: ["test_device_01"],
        name: "Test Device",
        model: "Air Quality Monitor",
        manufacturer: "DIY",
        sw_version: "1.0.0"
      }
    });
  });

  it("should include proper discovery config structure", async () => {
    const measurementData: MeasurementData = {
      co2Concentration: 900,
      relativeHumidity: 45,
      scd30Temperature: 20,
      bmp280Temperature: 19,
      meanSeaLevelPressure: 1030
    };

    await publishToMqtt(measurementData);

    // Get the CO2 discovery config payload
    const discoveryCall = (mockClient.publish as jest.Mock).mock.calls.find(
      (call) => call[0] === "homeassistant/sensor/test_device_01_co2_concentration/config"
    );
    const config = JSON.parse(discoveryCall[1]);

    expect(config).toMatchObject({
      name: "CO₂ Concentration",
      unique_id: "test_device_01_co2_concentration",
      state_topic: "homeassistant/sensor/test_device_01_co2_concentration/state",
      unit_of_measurement: "ppm",
      device_class: "carbon_dioxide",
      state_class: "measurement",
      icon: "mdi:molecule-co2"
    });
  });

  it("should disconnect from MQTT broker after publishing", async () => {
    const measurementData: MeasurementData = {
      co2Concentration: 900,
      relativeHumidity: 45,
      scd30Temperature: 20,
      bmp280Temperature: 19,
      meanSeaLevelPressure: 1030
    };

    await publishToMqtt(measurementData);

    expect(mockClient.end).toHaveBeenCalled();
  });

  it("should use default values when environment variables are not set", async () => {
    delete process.env.MQTT_CLIENT_ID;
    delete process.env.MQTT_TOPIC_PREFIX;
    delete process.env.MQTT_DEVICE_NAME;
    delete process.env.MQTT_DEVICE_ID;
    delete process.env.MQTT_ENABLE_HA_DISCOVERY;

    const measurementData: MeasurementData = {
      co2Concentration: 900,
      relativeHumidity: 45,
      scd30Temperature: 20,
      bmp280Temperature: 19,
      meanSeaLevelPressure: 1030
    };

    await publishToMqtt(measurementData);

    expect(mockConnect).toHaveBeenCalledWith("mqtt://localhost:1883", {
      clientId: expect.stringMatching(/^air-quality-monitor-\d+$/),
      username: "testuser",
      password: "testpass",
      reconnectPeriod: 1000,
      connectTimeout: 30000
    });

    // Should still publish with defaults (discovery enabled by default)
    expect(mockClient.publish).toHaveBeenCalledWith(
      "homeassistant/sensor/air_quality_monitor_01_co2_concentration/config",
      expect.any(String),
      { qos: 1 },
      expect.any(Function)
    );
  });
});
