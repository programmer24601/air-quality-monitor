export type Site = {
  elevation?: string;
  id?: string;
  latitude: string;
  longitude: string;
  name?: string;
  region?: string;
  unitaryAuthArea?: string;
};

export type ObservationSites = {
  Locations: {
    Location: Site[];
  };
};
