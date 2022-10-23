import { writeToDisplay } from "./writeToDisplay";
import { MeasurementData } from "./types/Measurement";
import LCD from "raspberrypi-liquid-crystal";

const mockPrint = jest.fn();
const mockPrintLine = jest.fn();
const mockSetCursor = jest.fn();
const mockCreateChar = jest.fn();
const mockBegin = jest.fn();
const mockNoDisplay = jest.fn();
const mockDisplay = jest.fn();

jest.mock("raspberrypi-liquid-crystal", () => {
  return jest.fn().mockImplementation(() => {
    return {
      begin: mockBegin,
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
    scd30Temperature: 19.5,
    bmp280Temperature: 19.0,
    relativeHumidity: 45,
    meanSeaLevelPressure: 1020
  };

  it("should connect to display and print out measurements", async () => {
    const mockGetChar = jest.fn().mockReturnValue("string");
    LCD.getChar = mockGetChar;

    await writeToDisplay(measurementData);

    expect(mockPrintLine).toBeCalledTimes(4);
    expect(mockPrintLine).toHaveBeenNthCalledWith(1, 0, `T: 19.50, 19.00  C`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(2, 1, `RH: 45.00 %`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(3, 2, `MSLP: 1020.00 hPa`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(4, 3, `CO2: 850.00 ppm`);

    expect(mockCreateChar).toBeCalledTimes(1);
    expect(mockCreateChar).toHaveBeenCalledWith(0, [0x1c, 0x14, 0x1c, 0x0, 0x0, 0x0, 0x0, 0x0]);

    expect(mockSetCursor).toBeCalledTimes(1);
    expect(mockSetCursor).toHaveBeenCalledWith(16, 0);

    expect(mockPrint).toHaveBeenCalledTimes(1);
    expect(mockPrint).toHaveBeenCalledWith("string");
  });
  /*
    
*/
  test.each`
    datetime                 | noDisplay | display | begin
    ${"2022-05-17T21:00:00"} | ${0}      | ${1}    | ${1}
    ${"2022-05-17T21:59:00"} | ${0}      | ${1}    | ${1}
    ${"2022-05-17T22:00:00"} | ${1}      | ${0}    | ${1}
    ${"2022-05-17T22:02:30"} | ${1}      | ${0}    | ${1}
    ${"2022-05-17T22:05:00"} | ${1}      | ${0}    | ${1}
    ${"2022-05-17T22:10:00"} | ${0}      | ${0}    | ${0}
    ${"2022-05-17T02:00:00"} | ${0}      | ${0}    | ${0}
    ${"2022-05-17T05:59:00"} | ${0}      | ${0}    | ${0}
    ${"2022-05-17T06:00:00"} | ${0}      | ${1}    | ${1}
    ${"2022-05-17T06:02:30"} | ${0}      | ${1}    | ${1}
    ${"2022-05-17T06:05:00"} | ${0}      | ${1}    | ${1}
    ${"2022-05-17T06:10:00"} | ${0}      | ${1}    | ${1}
  `(
    "at $datetime noDisplay=$noDisplay, display=$display, begin=$begin",
    async ({
      datetime,
      noDisplay,
      display,
      begin
    }: {
      datetime: string;
      noDisplay: number;
      display: number;
      begin: number;
    }) => {
      jest.useFakeTimers().setSystemTime(new Date(datetime));

      const mockGetChar = jest.fn().mockReturnValue("string");
      LCD.getChar = mockGetChar;

      await writeToDisplay(measurementData);

      expect(mockNoDisplay).toBeCalledTimes(noDisplay);
      expect(mockDisplay).toBeCalledTimes(display);
      expect(mockBegin).toBeCalledTimes(begin);
    }
  );
});
