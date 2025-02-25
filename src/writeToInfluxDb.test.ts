import { describe, expect, it, Mock, vi } from "vitest";
import { Measurement } from "./types/Measurement";
import { writeToInfluxDb } from "./writeToInfluxDb";

global.fetch = vi.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ test: 100 })
  })
) as Mock;

vi.stubEnv("INFLUXDB_API_KEY", "ffffffff-gggg-hhhh-iiii-jjjjjjjjjjjj");
vi.stubEnv("INFLUXDB_BASE_URL", "http://localhost:8086");
vi.stubEnv("INFLUXDB_ORG_NAME", "my_organisation");
vi.stubEnv("INFLUXDB_BUCKET_NAME", "data");

describe("writeToInfluxDb", () => {
  global.fetch = vi.fn();
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
    vi.mocked(fetch).mockResolvedValue(response);

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
