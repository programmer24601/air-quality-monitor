import dotenv from "dotenv";
import { SCD30 } from "scd30-node";
import type { MeasurementData } from "../types/MeasurementData";
import { publishToMqtt } from "src/publishToMqtt";

dotenv.config();

const dataReadinessWaitPeriod = 1000; //ms
const measurementInterval = 10000; //ms
const timeBeforeRecalibration = 300000; //ms
const timeAfterRecalibration = 60000; //ms
const localPressure = parseInt(process.env.LOCAL_PRESSURE!, 10);
const outdoorCo2Concentration = parseInt(process.env.OUTDOOR_CO2_CONCENTRATION!, 10);

const readMeasurements = async (scd30: SCD30) => {
  while (!(await scd30.isDataReady())) {
    console.log("SCD30 data not ready");
    await new Promise((resolve) => setTimeout(resolve, dataReadinessWaitPeriod));
  }

  const scd30Measurement = await scd30.readMeasurement();
  console.log(`CO2 Concentration = ${scd30Measurement.co2Concentration} ppm`);

  const measurementData: MeasurementData = {
    co2Concentration: scd30Measurement.co2Concentration,
    bmp280Temperature: 99,
    scd30Temperature: scd30Measurement.temperature,
    relativeHumidity: scd30Measurement.relativeHumidity,
    meanSeaLevelPressure: localPressure
  };

  await publishToMqtt(measurementData).catch((error): unknown =>
    console.error("Error: ", error.message)
  );

  await new Promise((resolve) => setTimeout(resolve, measurementInterval));
};

(async () => {
  try {
    let keepCalling = true;

    const scd30 = await SCD30.connect();
    await scd30.startContinuousMeasurement(localPressure);

    setTimeout(() => {
      keepCalling = false;
    }, timeBeforeRecalibration);

    while (keepCalling) {
      await readMeasurements(scd30);
    }

    console.log("Recalibrating...");
    await scd30.setForcedRecalibrationValue(outdoorCo2Concentration);

    keepCalling = true;

    setTimeout(() => {
      keepCalling = false;
    }, timeAfterRecalibration);

    while (keepCalling) {
      await readMeasurements(scd30);
    }

    await scd30.disconnect();
  } catch (error: unknown) {
    console.error((error as Error).message);
  }
})();
