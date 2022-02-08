export const getMeanSeaLevelPressure = async (siteId: string): Promise<number> => {
  const response = await fetch(constructUrl(siteId).toString(), {
    method: "GET"
  });

  const latestObservations = await response.json();

  return extractLatestMeanSeaLevelPressure(latestObservations);

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
  return latestObservations.SiteRep.DV.Location.Period.at(-1).Rep.at(-1).P;
};


