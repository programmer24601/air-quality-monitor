import { describe, expect, it, vi } from "vitest";
import { mockDeep } from "vitest-mock-extended";
import { BusInterface } from "async-i2c-bus";
import { BMP280Interface } from "async-bmp280";
import { readBmp280 } from "./readBmp280";

vi.mock("async-bmp280");
vi.mock("async-i2c-bus");

const i2cMock = mockDeep<BusInterface>();
i2cMock.open.mockImplementation(vi.fn());

const bmp280Mock = mockDeep<BMP280Interface>();
bmp280Mock.readPressure.mockResolvedValue(102000);

describe.skip("readBmp280", () => {
  it("should read the local atmospheric pressure from the BMP280 sensor", async () => {
    const pressure = await readBmp280();

    expect(pressure).toEqual(102000);
  });
});
