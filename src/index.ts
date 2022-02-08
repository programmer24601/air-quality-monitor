import { calculateLocalPressure } from "./calculateLocalPressure";
import { findNearestObservationSite } from "./findNearestObservationSite";
import { getMeanSeaLevelPressure } from "./getMeanSeaLevelPressure";
import { measure } from "./measure";

(async () => {
  try {
    const localElevation = parseInt(process.env.LOCAL_ELEVATION!);

    const measurementWithoutPressureCorrection = await measure();
    
    const nearestObservationSite = await findNearestObservationSite();
    const meanSeaLevelPressure = await getMeanSeaLevelPressure(nearestObservationSite);
    const localPressure = calculateLocalPressure(
      meanSeaLevelPressure,
      localElevation,
      measurementWithoutPressureCorrection.temperature
    );

    const measurementWithPressureCorrection = await measure(localPressure);

    console.log(`CO2 Concentration: ${measurementWithPressureCorrection.co2Concentration} ppm`);
    console.log(`Temperature: ${measurementWithPressureCorrection.temperature} °C`);
    console.log(`Humidity: ${measurementWithPressureCorrection.relativeHumidity} %`);
  } catch (error: unknown) {
    console.error((error as Error).message);
  }
})();
