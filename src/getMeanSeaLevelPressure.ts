import fetch from "node-fetch";

export const getMeanSeaLevelPressure = async (siteId: string): Promise<number> => {
  const apiKey = process.env.MET_OFFICE_DATAPOINT_API_KEY!;
  const response = await fetch(constructUrl(siteId, apiKey).toString(), {
    method: "GET"
  });

  const latestObservations = await response.json();
  const meanSeaLevelPressure = extractLatestMeanSeaLevelPressure(latestObservations);
  console.log(`MSLP: ${meanSeaLevelPressure} hPa`);
  
  return meanSeaLevelPressure;
};

const constructUrl = (siteId: string, apiKey: string): URL => {
  const format = "json";

  const url = new URL(
    `http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/${format}/${siteId}`
  );
  url.searchParams.append("res", "hourly");
  url.searchParams.append("key", `${apiKey}`);

  return url;
};

const extractLatestMeanSeaLevelPressure = (latestObservations: any): number => {
  return latestObservations.SiteRep.DV.Location.Period.at(-1).Rep.at(-1).P;
};
