import { readScd30 } from "./readScd30";
import { SCD30 } from "scd30-node";
import { mocked } from "jest-mock";
import { Scd30MeasurementData } from "./types/MeasurementData";

jest.mock("scd30-node");
jest.spyOn(global, "setTimeout");

const isDataReady = jest.fn().mockResolvedValue(true);

const mockStaticConnect = jest.fn().mockImplementation(() => {
  return {
    startContinuousMeasurement: jest.fn(),
    readMeasurement: jest.fn().mockResolvedValue({
      co2Concentration: 450,
      temperature: 20,
      relativeHumidity: 45
    }),
    disconnect: jest.fn(),
    isDataReady
  };
});

SCD30.connect = mockStaticConnect;

afterEach(() => {
  jest.clearAllMocks();
});

describe("readScd30", () => {
  it("should connect to scd30 and get measurements when pressure is provided", async () => {
    const measurementData = await readScd30(103000);

    expect(SCD30.connect).toBeCalledTimes(1);

    const expectedMeasurementData: Scd30MeasurementData = {
      co2Concentration: 450,
      temperature: 20,
      relativeHumidity: 45
    };

    expect(measurementData).toEqual(expectedMeasurementData);
  });

  it("should call setTimeout when data is not ready", async () => {
    jest.setTimeout(10000);

    mocked(isDataReady).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    await readScd30(103000);

    expect(setTimeout).toHaveBeenCalledTimes(1);
  });
});
