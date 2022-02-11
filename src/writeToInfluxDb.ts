import { InfluxDbParams } from "./types/InfluxDbParams";
import { Measurement } from "./types/Measurement";
import fetch from "node-fetch";

export const writeToInfluxDb = async (measurement: Measurement): Promise<void> => {
  const influxDbParams = getInfluxDbParams();
  const url = constructUrl(influxDbParams).toString();
  console.log(url);

  const response = await fetch(url, {
    method: "POST",
    body: convertMeasurementToLineProtocolFormat(measurement),
    headers: { "Content-Type": "text/plain", Authorization: `Token ${influxDbParams.apiKey}` }
  });

  console.log(response.status, response.statusText);
};

const getInfluxDbParams = (): InfluxDbParams => {
  return {
    baseUrl: process.env.INFLUXDB_BASE_URL!,
    apiKey: process.env.INFLUXDB_API_KEY!,
    organisation: process.env.INFLUXDB_ORG_NAME!,
    bucketName: process.env.INFLUXDB_BUCKET_NAME!,
    measurementName: process.env.INFLUXDB_MEASUREMENT_NAME!
  };
};

const constructUrl = (influxDbParams: InfluxDbParams): URL => {
  const url = new URL(`${influxDbParams.baseUrl}/api/v2/write`);
  url.searchParams.append("bucket", influxDbParams.bucketName);
  url.searchParams.append("org", influxDbParams.organisation);
  url.searchParams.append("precision", "s");

  return url;
};

const convertMeasurementToLineProtocolFormat = (measurement: Measurement): string => {
  const measurementData = Object.entries(measurement.data)
    .reduce((accumulator: Array<string>, [key, value]) => {
      return [...accumulator, `${camelToSnakeCase(key)}=${value}`];
    }, [])
    .join(",");

  return `${measurement.name},${measurement.tagKey}=${measurement.tagValue} ${measurementData}`;
};

const camelToSnakeCase = (string: string) =>
  string.replace(/[A-Z]/g, (upperCaseLetter) => `_${upperCaseLetter.toLowerCase()}`);
