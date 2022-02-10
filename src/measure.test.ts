import { measure } from "./measure";
import { SCD30 } from "scd30-node";

jest.mock("scd30-node");

const mockStaticConnect = jest.fn().mockImplementation(() => {
  return {
    startContinuousMeasurement: jest.fn().mockReturnThis(),
    readMeasurement: jest.fn().mockResolvedValue({
      co2Concentration: 450,
      temperature: 20,
      relativeHumidity: 45
    }),
    disconnect: jest.fn().mockReturnThis()
  };
});

SCD30.connect = mockStaticConnect;

afterEach(() => {
  jest.clearAllMocks();
});

describe("measure", () => {
  it("should connect to scd30 and get measurements when pressure is not provided", async () => {
    const measurement = await measure();

    expect(SCD30.connect).toBeCalledTimes(1);

    expect(measurement).toEqual({
      co2Concentration: 450,
      temperature: 20,
      relativeHumidity: 45
    });
  });

  it("should connect to scd30 and get measurements when pressure is provided", async () => {
    const measurement = await measure(1030);

    expect(SCD30.connect).toBeCalledTimes(1);

    expect(measurement).toEqual({
      co2Concentration: 450,
      temperature: 20,
      relativeHumidity: 45
    });
  });
});
