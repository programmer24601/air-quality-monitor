import { calculateLocalPressure } from "./calculateLocalPressure";
// import { findNearestObservationSite } from "./findNearestObservationSite";
import { getMeanSeaLevelPressure } from "./getMeanSeaLevelPressure";
import { readScd30 } from "./readScd30";
import { Measurement, MeasurementData } from "./types/Measurement";
import { writeToInfluxDb } from "./writeToInfluxDb";
import dotenv from "dotenv";
import { writeToDisplay } from "./writeToDisplay";

dotenv.config();

const logSensorReadings = (measurementData: MeasurementData): void => {
  console.log(`CO2 Concentration: ${measurementData.co2Concentration} ppm`);
  console.log(`Temperature: ${measurementData.temperature} °C`);
  console.log(`Humidity: ${measurementData.relativeHumidity} %`);
  console.log(`Pressure: ${measurementData.pressure} hPa`);
};

(async () => {
  try {
    const localElevation = parseInt(process.env.LOCAL_ELEVATION!);

    const measurementWithoutPressureCorrection = await readScd30();

    // const nearestObservationSite = await findNearestObservationSite();
    const nearestObservationSite = process.env.MET_OFFICE_OBSERVATION_SITE!;
    const meanSeaLevelPressure = await getMeanSeaLevelPressure(nearestObservationSite);
    const localPressure = calculateLocalPressure(
      meanSeaLevelPressure,
      localElevation,
      measurementWithoutPressureCorrection.temperature
    );

    const measurementWithPressureCorrection = await readScd30(localPressure);
    const measurement: Measurement = {
      name: process.env.INFLUXDB_MEASUREMENT_NAME!,
      tagKey: process.env.INFLUXDB_MEASUREMENT_TAG_KEY!,
      tagValue: process.env.INFLUXDB_MEASUREMENT_TAG_VALUE!,
      data: measurementWithPressureCorrection
    };

    await writeToInfluxDb(measurement);
    await writeToDisplay(measurement.data);

    logSensorReadings(measurementWithPressureCorrection);
  } catch (error: unknown) {
    console.error((error as Error).message);
  }
})();
