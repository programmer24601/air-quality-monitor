
import { readScd30 } from "./readScd30";
import { Measurement, MeasurementData } from "./types/Measurement";
import { writeToInfluxDb } from "./writeToInfluxDb";
import dotenv from "dotenv";
import { writeToDisplay } from "./writeToDisplay";
import { readBmp280 } from "./readBmp280";
import { calculateMeanSeaLevelPressure } from "./calculateMeanSeaLevelPressure";

dotenv.config();

const logSensorReadings = (measurementData: MeasurementData): void => {
  console.log(`CO2 Concentration: ${measurementData.co2Concentration} ppm`);
  console.log(`SCD30 Temperature: ${measurementData.scd30Temperature} °C`);
  console.log(`BMP280 Temperature: ${measurementData.bmp280Temperature} °C`);
  console.log(`Humidity: ${measurementData.relativeHumidity} %`);
  console.log(`Pressure: ${measurementData.meanSeaLevelPressure} hPa`);
};

(async () => {
  try {
    const bmp280MeasurementData = await readBmp280();
    const localElevation = parseInt(process.env.LOCAL_ELEVATION!);
    const meanSeaLevelPressure = calculateMeanSeaLevelPressure(bmp280MeasurementData, localElevation);
    const scd30MeasurementData = await readScd30(bmp280MeasurementData.localPressure);

    const measurementData: MeasurementData = {
      co2Concentration: scd30MeasurementData.co2Concentration,
      bmp280Temperature: bmp280MeasurementData.temperature,
      scd30Temperature: scd30MeasurementData.temperature,
      relativeHumidity: scd30MeasurementData.relativeHumidity,
      meanSeaLevelPressure: meanSeaLevelPressure
  }

    const measurement: Measurement = {
      name: process.env.INFLUXDB_MEASUREMENT_NAME!,
      tagKey: process.env.INFLUXDB_MEASUREMENT_TAG_KEY!,
      tagValue: process.env.INFLUXDB_MEASUREMENT_TAG_VALUE!,
      data: measurementData
    };

    await writeToInfluxDb(measurement).catch((error): unknown =>
      console.error("Error: ", error.message)
    );
    
    await writeToDisplay(measurement.data);

    logSensorReadings(measurementData);
  } catch (error: unknown) {
    console.error((error as Error).message);
  }
})();
