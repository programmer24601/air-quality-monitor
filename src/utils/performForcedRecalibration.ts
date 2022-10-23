import { SCD30 } from "scd30-node";
import { Measurement, MeasurementData } from "../types/Measurement";
import { writeToInfluxDb } from "../writeToInfluxDb";
import dotenv from "dotenv";

dotenv.config();

const dataReadinessWaitPeriod = 500; //ms
const measurementInterval = 2000; //ms
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
}

  const measurement: Measurement = {
    name: process.env.INFLUXDB_MEASUREMENT_NAME!,
    tagKey: process.env.INFLUXDB_MEASUREMENT_TAG_KEY!,
    tagValue: process.env.INFLUXDB_MEASUREMENT_TAG_VALUE!,
    data: measurementData
  };

  await writeToInfluxDb(measurement);

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
