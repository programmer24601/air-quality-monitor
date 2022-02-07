import { getPressure } from "./getPressure";

describe("getPressure", () => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => hourlyObservations
  } as Response);
  it("should return the latest pressure reading adjusted for current location", async () => {
    await getPressure();
  });
});

const hourlyObservations = {
  SiteRep: {
    DV: {
      dataDate: "2022-02-07T16:00:00Z",
      type: "Obs",
      Location: {
        i: "3344",
        lat: "53.811",
        lon: "-1.865",
        name: "BINGLEY SAMOS",
        country: "ENGLAND",
        continent: "EUROPE",
        elevation: "262.0",
        Period: [
          {
            type: "Day",
            value: "2022-02-06Z",
            Rep: [
              {
                D: "WNW",
                G: "47",
                H: "81.8",
                P: "1001",
                S: "17",
                T: "3.3",
                V: "45000",
                W: "8",
                Pt: "R",
                Dp: "0.5",
                $: "960"
              },
              {
                D: "WNW",
                G: "48",
                H: "83.5",
                P: "1003",
                S: "23",
                T: "2.8",
                V: "27000",
                W: "12",
                Pt: "R",
                Dp: "0.3",
                $: "1020"
              },
              {
                D: "WNW",
                G: "43",
                H: "87.8",
                P: "1004",
                S: "18",
                T: "1.8",
                V: "45000",
                W: "2",
                Pt: "R",
                Dp: "0.0",
                $: "1080"
              }
            ]
          }
        ]
      }
    }
  }
};
