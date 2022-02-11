import { Measurement } from "./types/Measurement";
import { writeToInfluxDb } from "./writeToInfluxDb";
import fetch from "node-fetch";

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
        temperature: 20
      }
    };
    await writeToInfluxDb(measurement);

    expect(fetch).toBeCalledTimes(1);
    expect(fetch).toBeCalledWith(
      "http://localhost:8086/api/v2/write?bucket=undefined&org=my_organisation&precision=s",
      {
        body: "measurement,location=office co2_concentration=900,relative_humidity=45,temperature=20",
        headers: {
          Authorization: "Token ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj",
          "Content-Type": "text/plain"
        },
        method: "POST"
      }
    );
  });
});
