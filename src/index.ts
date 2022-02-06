import { measure } from "./measure";

(async () => {
  try {
    const measurement = await measure();

    console.log(`CO2 Concentration: ${measurement.co2Concentration} ppm`);
    console.log(`Temperature: ${measurement.temperature} °C`);
    console.log(`Humidity: ${measurement.relativeHumidity} %`);
    
  } catch (error: unknown) {
    console.error((error as Error).message);
  }
})();
