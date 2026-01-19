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
    process.env.MQTT_TOPIC_PREFIX = "test/sensors";
  });

  afterEach(() => {
    delete process.env.MQTT_BROKER_URL;
    delete process.env.MQTT_USERNAME;
    delete process.env.MQTT_PASSWORD;
    delete process.env.MQTT_CLIENT_ID;
    delete process.env.MQTT_TOPIC_PREFIX;
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

  it("should publish individual sensor readings to separate topics", async () => {
    const measurementData: MeasurementData = {
      co2Concentration: 900,
      relativeHumidity: 45,
      scd30Temperature: 20,
      bmp280Temperature: 19,
      meanSeaLevelPressure: 1030
    };

    await publishToMqtt(measurementData);

    // Check that publish was called for each sensor reading plus summary
    expect(mockClient.publish).toHaveBeenCalledTimes(6);

    // Check individual topics
    expect(mockClient.publish).toHaveBeenCalledWith(
      "test/sensors/co2_concentration",
      expect.stringContaining('"value":900'),
      { qos: 1 },
      expect.any(Function)
    );

    expect(mockClient.publish).toHaveBeenCalledWith(
      "test/sensors/relative_humidity",
      expect.stringContaining('"value":45'),
      { qos: 1 },
      expect.any(Function)
    );

    expect(mockClient.publish).toHaveBeenCalledWith(
      "test/sensors/scd30_temperature",
      expect.stringContaining('"value":20'),
      { qos: 1 },
      expect.any(Function)
    );

    expect(mockClient.publish).toHaveBeenCalledWith(
      "test/sensors/bmp280_temperature",
      expect.stringContaining('"value":19'),
      { qos: 1 },
      expect.any(Function)
    );

    expect(mockClient.publish).toHaveBeenCalledWith(
      "test/sensors/mean_sea_level_pressure",
      expect.stringContaining('"value":1030'),
      { qos: 1 },
      expect.any(Function)
    );
  });

  it("should publish summary data to summary topic", async () => {
    const measurementData: MeasurementData = {
      co2Concentration: 900,
      relativeHumidity: 45,
      scd30Temperature: 20,
      bmp280Temperature: 19,
      meanSeaLevelPressure: 1030
    };
    await publishToMqtt(measurementData);

    expect(mockClient.publish).toHaveBeenCalledWith(
      "test/sensors/summary",
      expect.stringContaining('"co2Concentration":900'),
      { qos: 1 },
      expect.any(Function)
    );
  });

  it("should include proper payload structure with units and timestamp", async () => {
    const measurementData: MeasurementData = {
      co2Concentration: 900,
      relativeHumidity: 45,
      scd30Temperature: 20,
      bmp280Temperature: 19,
      meanSeaLevelPressure: 1030
    };

    await publishToMqtt(measurementData);

    // Get the first call's payload and parse it
    const call = (mockClient.publish as jest.Mock).mock.calls.find(
      (call) => call[0] === "test/sensors/co2_concentration"
    );
    const payload = JSON.parse(call[1]);

    expect(payload).toMatchObject({
      value: 900,
      unit: "ppm"
    });
    expect(payload.timestamp).toBeDefined();
    expect(new Date(payload.timestamp)).toBeInstanceOf(Date);
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

    expect(mockClient.publish).toHaveBeenCalledWith(
      "sensors/air-quality/co2_concentration",
      expect.any(String),
      { qos: 1 },
      expect.any(Function)
    );
  });
});
