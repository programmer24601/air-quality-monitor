export const getPressure = async (): Promise<number> => {
  const siteId = "3344"; // Bingley Samos
  const localElevation = 60; // metres

  const response = await fetch(constructUrl(siteId).toString(), {
    method: "GET"
  });

  const latestObservations = await response.json();

  const latestMeanSeaLevelPressure = extractLatestMeanSeaLevelPressure(latestObservations);
  const localPressure = calculateLocalPressure(latestMeanSeaLevelPressure, localElevation);

  return localPressure;
};

const constructUrl = (siteId: string): URL => {
  const format = "json";

  const url = new URL(
    `http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/${format}/${siteId}`
  );
  url.searchParams.append("res", "hourly");
  url.searchParams.append("key", `${process.env.MET_OFFICE_DATAPOINT_API_KEY}`);

  return url;
};

const extractLatestMeanSeaLevelPressure = (latestObservations: any): number => {
  latestObservations.SiteRep.DV.Location.Period;

  return 1234;
};

const calculateLocalPressure = (
  latestMeanSeaLevelPressure: number,
  localElevation: number
): number => {
  console.log(latestMeanSeaLevelPressure, localElevation);
  return 1021;
};
