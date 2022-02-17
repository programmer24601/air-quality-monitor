import LCD from "raspberrypi-liquid-crystal";
import { MeasurementData } from "./types/Measurement";

export const writeToDisplay = async (measurementData: MeasurementData): Promise<void> => {
  const i2cBus = 1;
  const i2cAddress = 0x27;
  const charactersPerLine = 16;
  const numberOfLines = 4;

  const lcd = new LCD(i2cBus, i2cAddress, charactersPerLine, numberOfLines);

  await lcd.begin();
  await lcd.clear();

  const data = formatMeasurementData(measurementData);

  await lcd.printLine(0, `T: ${data.temperature} °C`);
  await lcd.printLine(1, `RH: ${data.relativeHumidity} %`);
  await lcd.printLine(2, `P: ${data.pressure} hPa`);
  await lcd.printLine(3, `CO2: ${data.co2Concentration} ppm`);

  await lcd.setCursor(0, 8);
  const degreeSymbol = [0x1c, 0x14, 0x1c, 0x0, 0x0, 0x0, 0x0];
  await lcd.createChar(0, degreeSymbol);
};

const formatMeasurementData = (measurementData: MeasurementData) => {
  return {
    temperature: measurementData.temperature.toFixed(2).toString(),
    relativeHumidity: measurementData.relativeHumidity.toFixed(2).toString(),
    pressure: measurementData.pressure.toFixed(2).toString(),
    co2Concentration: measurementData.co2Concentration.toFixed(2).toString()
  };
};
