import { ObservationSites } from "./types/ObservationSites";
import { Site } from "./types/Site";
import fetch from "node-fetch";

export const findNearestObservationSite = async (): Promise<string> => {
  const apiKey = process.env.MET_OFFICE_DATAPOINT_API_KEY!;
  const currentLocation: Site = {
    latitude: process.env.LOCAL_LATITUDE!,
    longitude: process.env.LOCAL_LONGITUDE!
  };

  const response = await fetch(constructUrl(apiKey).toString(), {
    method: "GET"
  });

  const observationSites = await response.json();

  const observationSiteId = calculateNearestSite(observationSites, currentLocation);

  return observationSiteId;
};

const constructUrl = (apiKey: string): URL => {
  const format = "json";

  const url = new URL(
    `http://datapoint.metoffice.gov.uk/public/data/val/wxobs/all/${format}/sitelist`
  );
  url.searchParams.append("key", `${apiKey}`);

  return url;
};

const calculateNearestSite = (
  observationSites: ObservationSites,
  currentLocation: Site
): string => {
  const sites: Site[] = observationSites.Locations.Location;

  const getDistance = (site: Site, currentLocation: Site) => {
    return Math.sqrt(
      Math.pow(parseFloat(site.latitude) - parseFloat(currentLocation.latitude), 2) +
        Math.pow(parseFloat(site.longitude) - parseFloat(currentLocation.longitude), 2)
    );
  };

  const nearestSite = sites.reduce((previousSite: Site, currentSite: Site) =>
    getDistance(previousSite, currentLocation) < getDistance(currentSite, currentLocation)
      ? previousSite
      : currentSite
  );
  return nearestSite.id!;
};
