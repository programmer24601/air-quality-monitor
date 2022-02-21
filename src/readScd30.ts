import { SCD30 } from "scd30-node";
import { MeasurementData } from "./types/Measurement";

export const readScd30 = async (pressure?: number): Promise<MeasurementData> => {
  const scd30 = await SCD30.connect();

  if (pressure) {
    await scd30.startContinuousMeasurement(pressure);
  } else {
    await scd30.startContinuousMeasurement();
  }

  while (!scd30.isDataReady) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const measurement = await scd30.readMeasurement();

  await scd30.disconnect();

  return { ...measurement, pressure: pressure ?? 0 };
};
