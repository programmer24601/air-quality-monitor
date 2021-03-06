import { writeToDisplay } from "./writeToDisplay";
import { MeasurementData } from "./types/Measurement";
import LCD from "raspberrypi-liquid-crystal";

const mockPrint = jest.fn();
const mockPrintLine = jest.fn();
const mockSetCursor = jest.fn();
const mockCreateChar = jest.fn();
const mockNoDisplay = jest.fn();
const mockDisplay = jest.fn();

jest.mock("raspberrypi-liquid-crystal", () => {
  return jest.fn().mockImplementation(() => {
    return {
      begin: jest.fn(),
      clear: jest.fn(),
      noDisplay: mockNoDisplay,
      display: mockDisplay,
      print: mockPrint,
      printLine: mockPrintLine,
      setCursor: mockSetCursor,
      createChar: mockCreateChar
    };
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("writeToDisplay", () => {
  const measurementData: MeasurementData = {
    co2Concentration: 850,
    temperature: 19.5,
    relativeHumidity: 45,
    pressure: 1020
  };

  it("should connect to display and print out measurements", async () => {
    const mockGetChar = jest.fn().mockReturnValue("string");

    LCD.getChar = mockGetChar;

    await writeToDisplay(measurementData);

    expect(mockPrintLine).toBeCalledTimes(4);
    expect(mockPrintLine).toHaveBeenNthCalledWith(1, 0, `T: 19.50  C`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(2, 1, `RH: 45.00 %`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(3, 2, `P: 1020.00 hPa`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(4, 3, `CO2: 850.00 ppm`);

    expect(mockCreateChar).toBeCalledTimes(1);
    expect(mockCreateChar).toHaveBeenCalledWith(0, [0x1c, 0x14, 0x1c, 0x0, 0x0, 0x0, 0x0, 0x0]);

    expect(mockSetCursor).toBeCalledTimes(1);
    expect(mockSetCursor).toHaveBeenCalledWith(9, 0);

    expect(mockPrint).toHaveBeenCalledTimes(1);
    expect(mockPrint).toHaveBeenCalledWith("string");
  });

  it("should turn off display when it is night time", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2022-05-17T03:24:00"));

    await writeToDisplay(measurementData);

    expect(mockNoDisplay).toBeCalledTimes(1);
    expect(mockDisplay).not.toBeCalled();
  });

  it("should turn off display when it is night time", async () => {
    jest.useFakeTimers().setSystemTime(new Date("2022-05-17T14:24:00"));

    await writeToDisplay(measurementData);

    expect(mockDisplay).toBeCalledTimes(1);
    expect(mockNoDisplay).not.toBeCalled();
  });
});
