export type Bmp280MeasurementData = {
  temperature: number;
  localPressure: number;
};

export type Scd30MeasurementData = {
  co2Concentration: number;
  temperature: number;
  relativeHumidity: number;
};

export type MeasurementData = {
  co2Concentration: number;
  bmp280Temperature: number;
  scd30Temperature: number;
  relativeHumidity: number;
  meanSeaLevelPressure: number;
};

export type FormattedMeasurementData = {
  co2Concentration: string;
  bmp280Temperature: string;
  scd30Temperature: string;
  relativeHumidity: string;
  meanSeaLevelPressure: string;
};

export type Measurement = {
  name: string;
  tagKey: string;
  tagValue: string;
  data: MeasurementData;
};
