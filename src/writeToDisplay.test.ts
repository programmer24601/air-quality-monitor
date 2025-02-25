import { afterEach, describe, expect, it, test, vi } from "vitest";
import { writeToDisplay } from "./writeToDisplay";
import { MeasurementData } from "./types/Measurement";
import LCD from "raspberrypi-liquid-crystal";

const mockPrint = vi.fn();
const mockPrintLine = vi.fn();
const mockSetCursor = vi.fn();
const mockCreateChar = vi.fn();
const mockBegin = vi.fn();
const mockNoDisplay = vi.fn();
const mockDisplay = vi.fn();

vi.mock("raspberrypi-liquid-crystal", () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        begin: mockBegin,
        clear: vi.fn(),
        noDisplay: mockNoDisplay,
        display: mockDisplay,
        print: mockPrint,
        printLine: mockPrintLine,
        setCursor: mockSetCursor,
        createChar: mockCreateChar
      };
    })
  };
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("writeToDisplay", () => {
  const measurementData: MeasurementData = {
    co2Concentration: 988.3440551757812,
    scd30Temperature: 23.958572387695312,
    bmp280Temperature: 22.810765738325426,
    relativeHumidity: 51.4404296875,
    meanSeaLevelPressure: 983.1633687965099
  };

  it("should connect to display and print out measurements", async () => {
    const mockGetChar = vi.fn().mockReturnValue("string");
    LCD.getChar = mockGetChar;

    await writeToDisplay(measurementData);

    expect(mockPrintLine).toBeCalledTimes(4);
    expect(mockPrintLine).toHaveBeenNthCalledWith(1, 0, `T: 23.96, 22.81  C`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(2, 1, `RH: 51.44 %`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(3, 2, `MSLP: 983.16 hPa`);
    expect(mockPrintLine).toHaveBeenNthCalledWith(4, 3, `CO2: 988.34 ppm`);

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
      vi.useFakeTimers().setSystemTime(new Date(datetime));

      const mockGetChar = vi.fn().mockReturnValue("string");
      LCD.getChar = mockGetChar;

      await writeToDisplay(measurementData);

      expect(mockNoDisplay).toBeCalledTimes(noDisplay);
      expect(mockDisplay).toBeCalledTimes(display);
      expect(mockBegin).toBeCalledTimes(begin);
    }
  );
});
