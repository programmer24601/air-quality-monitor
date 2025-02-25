import { afterEach, describe, expect, it, test, vi } from "vitest";
import { readScd30 } from "./readScd30";
import { SCD30 } from "scd30-node";
import { Scd30MeasurementData } from "./types/Measurement";

vi.mock("scd30-node");
vi.spyOn(globalThis, "setTimeout");

const isDataReady = vi.fn().mockResolvedValue(true);

const mockStaticConnect = vi.fn().mockImplementation(() => {
  return {
    startContinuousMeasurement: vi.fn(),
    readMeasurement: vi.fn().mockResolvedValue({
      co2Concentration: 450,
      temperature: 20,
      relativeHumidity: 45
    }),
    disconnect: vi.fn(),
    isDataReady
  };
});

SCD30.connect = mockStaticConnect;

afterEach(() => {
  vi.clearAllMocks();
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

  it(
    "should call setTimeout when data is not ready",
    async () => {
      vi.mocked(isDataReady).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
      await readScd30(103000);
  
      expect(setTimeout).toHaveBeenCalledTimes(1);
    },
    10000 // Set timeout for this test
  );  
});
