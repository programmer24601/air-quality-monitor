import { SCD30 } from "scd30-node";
import { Scd30MeasurementData } from "./types/Measurement";

export const readScd30 = async (localPressure: number): Promise<Scd30MeasurementData> => {
  const scd30 = await SCD30.connect();

  await scd30.startContinuousMeasurement(localPressure);

  while (!(await scd30.isDataReady())) {
    console.log("SCD30 data not ready");
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  const measurement = await scd30.readMeasurement();

  await scd30.disconnect();

  return measurement;
};
