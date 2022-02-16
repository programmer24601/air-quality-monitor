import { calculateLocalPressure } from "./calculateLocalPressure";
// import { findNearestObservationSite } from "./findNearestObservationSite";
import { getMeanSeaLevelPressure } from "./getMeanSeaLevelPressure";
import { measure } from "./measure";
import { Measurement } from "./types/Measurement";
import { writeToInfluxDb } from "./writeToInfluxDb";
import dotenv from "dotenv";
import { writeToDisplay } from "./writeToDisplay";

dotenv.config();

(async () => {
  try {
    const localElevation = parseInt(process.env.LOCAL_ELEVATION!);

    const measurementWithoutPressureCorrection = await measure();

    // const nearestObservationSite = await findNearestObservationSite();
    const nearestObservationSite = process.env.MET_OFFICE_OBSERVATION_SITE!;
    const meanSeaLevelPressure = await getMeanSeaLevelPressure(nearestObservationSite);
    const localPressure = calculateLocalPressure(
      meanSeaLevelPressure,
      localElevation,
      measurementWithoutPressureCorrection.temperature
    );

    const measurementWithPressureCorrection = await measure(localPressure);
    const measurement: Measurement = {
      name: process.env.INFLUXDB_MEASUREMENT_NAME!,
      tagKey: process.env.INFLUXDB_MEASUREMENT_TAG_KEY!,
      tagValue: process.env.INFLUXDB_MEASUREMENT_TAG_VALUE!,
      data: measurementWithPressureCorrection
    };

    await writeToInfluxDb(measurement);
    await writeToDisplay(measurement.data);

    console.log(`CO2 Concentration: ${measurementWithPressureCorrection.co2Concentration} ppm`);
    console.log(`Temperature: ${measurementWithPressureCorrection.temperature} °C`);
    console.log(`Humidity: ${measurementWithPressureCorrection.relativeHumidity} %`);
    console.log(`Pressure: ${measurementWithPressureCorrection.pressure} hPa`);
  } catch (error: unknown) {
    console.error((error as Error).message);
  }
})();
