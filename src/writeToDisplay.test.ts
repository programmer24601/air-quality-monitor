import { writeToDisplay } from "./writeToDisplay";
import { MeasurementData } from "./types/Measurement";

const mockPrintLine = jest.fn();
jest.mock("raspberrypi-liquid-crystal", () => {
  return jest.fn().mockImplementation(() => {
    return {
      begin: jest.fn(),
      clear: jest.fn(),
      printLine: mockPrintLine
    };
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("measure", () => {
  it("should connect to display and print out measurements", async () => {
    const measurementData: MeasurementData = {
      co2Concentration: 850,
      temperature: 19.5,
      relativeHumidity: 45,
      pressure: 1020
    };
    await writeToDisplay(measurementData);

    expect(mockPrintLine).toBeCalledTimes(4);
    expect(mockPrintLine).toHaveBeenNthCalledWith(1, 0, `T: 19.50 °C`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(2, 1, `RH: 45.00 %`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(3, 2, `P: 1020.00 hPa`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(4, 3, `CO2: 850.00 ppm`);
  });
});
