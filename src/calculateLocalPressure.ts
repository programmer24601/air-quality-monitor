export const calculateLocalPressure = (
  latestMeanSeaLevelPressure: number,
  localElevation: number,
  temperature: number
): number => {
  const p_0 = latestMeanSeaLevelPressure * 100; // sea level standard atmospheric pressure (Pa)
  const g = 9.80665; // earth-surface gravitational acceleration (m/s^2)
  const h = localElevation; // height above earth-surface (m)
  const c_p = 1004.68506; // constant-pressure specific heat (J/(kg*K))
  const T_0 = temperature + 273.15; // sea level standard temperature (K)
  const M = 0.02896968; // molar mass of dry air (kg/mol)
  const R_0 = 8.314462618; // universal gas constant (J/(mol*K))

  // barometric formula: https://en.wikipedia.org/wiki/Atmospheric_pressure#Altitude_variation
  const p = p_0 * (1 - (g * h) / (c_p * T_0)) ** ((c_p * M) / R_0);

  const pressure = Math.round(p) / 100; // convert Pa to hPa and round to two decimal places

  return pressure;
};
