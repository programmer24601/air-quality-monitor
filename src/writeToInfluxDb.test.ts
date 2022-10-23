import { Measurement } from "./types/Measurement";
import { writeToInfluxDb } from "./writeToInfluxDb";
import fetch, { Response } from "node-fetch";
import { mocked } from "jest-mock";

jest.mock("node-fetch", () => jest.fn());

describe("writeToInfluxDb", () => {
  global.fetch = jest.fn();
  it("should call fetch with correct parameters", async () => {
    const measurement: Measurement = {
      name: "measurement",
      tagKey: "location",
      tagValue: "office",
      data: {
        co2Concentration: 900,
        relativeHumidity: 45,
        scd30Temperature: 20,
        bmp280Temperature: 19,
        meanSeaLevelPressure: 1030
      }
    };
    const response = { status: 204, statusText: "No Content" } as unknown as Response;
    mocked(fetch).mockResolvedValue(response);

    await writeToInfluxDb(measurement);

    expect(fetch).toBeCalledTimes(1);
    expect(fetch).toBeCalledWith(
      "http://localhost:8086/api/v2/write?bucket=data&org=my_organisation&precision=s",
      {
        body: "measurement,location=office co2_concentration=900,relative_humidity=45,scd30_temperature=20,bmp280_temperature=19,mean_sea_level_pressure=1030",
        headers: {
          Authorization: "Token ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj",
          "Content-Type": "text/plain"
        },
        method: "POST"
      }
    );
  });
});
