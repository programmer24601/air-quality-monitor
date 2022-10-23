import { Bmp280MeasurementData } from "./types/Measurement";

export const calculateMeanSeaLevelPressure = (
  bmp280MeasurementData: Bmp280MeasurementData,
  localElevation: number
): number => {
  const p = bmp280MeasurementData.localPressure * 100; // local atmospheric pressure (Pa)
  const g = 9.80665; // earth-surface gravitational acceleration (m/s^2)
  const h = localElevation; // height above earth-surface (m)
  const c_p = 1004.68506; // constant-pressure specific heat (J/(kg*K))
  const T_0 = bmp280MeasurementData.temperature + 273.15; // sea level standard temperature (K)
  const M = 0.02896968; // molar mass of dry air (kg/mol)
  const R_0 = 8.314462618; // universal gas constant (J/(mol*K))

  // barometric formula: https://en.wikipedia.org/wiki/Atmospheric_pressure#Altitude_variation
  const p_0 = p / (1 - (g * h) / (c_p * T_0)) ** ((c_p * M) / R_0);

  return convertFromPaToHPa(p_0); // convert Pa to hPa and round to two decimal places
};

const convertFromPaToHPa = (pressureInPa: number): number => {
  return pressureInPa / 100;
};
