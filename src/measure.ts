import { SCD30 } from "scd30-node";
import { Measurement } from "./types/Measurement";

export const measure = async (pressure?: number): Promise<Measurement> => {
  const scd30 = await SCD30.connect();

  if (pressure) {
    await scd30.startContinuousMeasurement(pressure);
  } else {
    await scd30.startContinuousMeasurement();
  }

  const measurement = await scd30.readMeasurement();

  await scd30.disconnect();

  return measurement;
};
