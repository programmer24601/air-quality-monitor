export type MeasurementData = {
  co2Concentration: number;
  temperature: number;
  relativeHumidity: number;
  pressure: number;
};

export type Measurement = {
  name: string;
  tagKey: string;
  tagValue: string;
  data: MeasurementData;
};
