import LCD from "raspberrypi-liquid-crystal";
import { FormattedMeasurementData, MeasurementData } from "./types/MeasurementData";

export const writeToDisplay = async (measurementData: MeasurementData): Promise<void> => {
  const i2cBus = 1;
  const i2cAddress = 0x27;
  const charactersPerLine = 20;
  const numberOfLines = 4;

  const dawn = 6;
  const dusk = 22;

  const isItNightTime = (): boolean => {
    const now = new Date();
    const hour = now.getHours();

    return hour >= dusk || hour < dawn ? true : false;
  };

  const isWithinFirstFiveMinutesOfDusk = (): boolean => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    return hour === dusk && (minute <= 5) ? true : false;
  };

  const lcd = new LCD(i2cBus, i2cAddress, charactersPerLine, numberOfLines);

  if (isWithinFirstFiveMinutesOfDusk() === true) {
    await lcd.begin();
    await lcd.clear();
    await lcd.noDisplay();
  } else if (isItNightTime() === false) {
    await lcd.begin();
    await lcd.clear();
    await lcd.display();

    const data = formatMeasurementData(measurementData);

    await lcd.printLine(0, `T: ${data.scd30Temperature}, ${data.bmp280Temperature}  C`);
    await lcd.printLine(1, `RH: ${data.relativeHumidity} %`);
    await lcd.printLine(2, `MSLP: ${data.meanSeaLevelPressure} hPa`);
    await lcd.printLine(3, `CO2: ${data.co2Concentration} ppm`);

    const degreeSymbol = [0x1c, 0x14, 0x1c, 0x0, 0x0, 0x0, 0x0, 0x0];
    await lcd.createChar(0, degreeSymbol);
    await lcd.setCursor(calculateCursorPosition(data), 0);
    await lcd.print(LCD.getChar(0));
  }
};

const formatMeasurementData = (measurementData: MeasurementData): FormattedMeasurementData => {
  return {
    scd30Temperature: measurementData.scd30Temperature.toFixed(2).toString(),
    bmp280Temperature: measurementData.bmp280Temperature.toFixed(2).toString(),
    relativeHumidity: measurementData.relativeHumidity.toFixed(2).toString(),
    meanSeaLevelPressure: measurementData.meanSeaLevelPressure.toFixed(2).toString(),
    co2Concentration: measurementData.co2Concentration.toFixed(2).toString()
  };
};

const calculateCursorPosition = (data: FormattedMeasurementData): number => {
  const measurementTitleLength = 6;
  return measurementTitleLength + data.scd30Temperature.length + data.bmp280Temperature.length;
};
