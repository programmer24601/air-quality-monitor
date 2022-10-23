import { Bus } from "async-i2c-bus";
import { BMP280 } from "async-bmp280";
import { Bmp280MeasurementData } from "./types/Measurement";

export const readBmp280 = async (): Promise<Bmp280MeasurementData> => {
  const busNumber = 1;
  const bus = Bus({ busNumber });

  await bus.open();

  const bmp280 = BMP280({ address: 0x76, bus });

  await bmp280.init();

  const temperature = await bmp280.readTemperature();
  const localPressure = await bmp280.readPressure();
  console.log(`Pressure: ${localPressure} Pa`);

  await bus.close();

  return { temperature, localPressure };
};
