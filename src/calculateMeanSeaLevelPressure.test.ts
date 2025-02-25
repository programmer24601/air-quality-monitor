import { describe, expect, test } from "vitest";
import { calculateMeanSeaLevelPressure } from "./calculateMeanSeaLevelPressure";

describe("calculateMeanSeaLevelPressure", () => {
  test.each`
    localPressure | temperature | localElevation | expectedMeanSeaLevelPressure
    ${990}        | ${0}        | ${0}           | ${990}
    ${990}        | ${0}        | ${50}          | ${996.2170240463213}
    ${990}        | ${0}        | ${100}         | ${1002.4843330407407}
    ${990}        | ${10}       | ${0}           | ${990}
    ${990}        | ${10}       | ${50}          | ${995.996603909954}
    ${990}        | ${10}       | ${100}         | ${1002.0399873643721}
    ${990}        | ${20}       | ${0}           | ${990}
    ${990}        | ${20}       | ${50}          | ${995.7912782455678}
    ${990}        | ${20}       | ${100}         | ${1001.6261847988567}
    ${1010}       | ${0}        | ${0}           | ${1010}
    ${1010}       | ${0}        | ${50}          | ${1016.3426204917017}
    ${1010}       | ${0}        | ${100}         | ${1022.7365417890385}
    ${1010}       | ${10}       | ${0}           | ${1010}
    ${1010}       | ${10}       | ${50}          | ${1016.1177474232863}
    ${1010}       | ${10}       | ${100}         | ${1022.2832194323393}
    ${1010}       | ${20}       | ${0}           | ${1010}
    ${1010}       | ${20}       | ${50}          | ${1015.9082737656802}
    ${1010}       | ${20}       | ${100}         | ${1021.8610572190356}
    ${1030}       | ${0}        | ${0}           | ${1030}
    ${1030}       | ${0}        | ${50}          | ${1036.468216937082}
    ${1030}       | ${0}        | ${100}         | ${1042.9887505373363}
    ${1030}       | ${10}       | ${0}           | ${1030}
    ${1030}       | ${10}       | ${50}          | ${1036.2388909366186}
    ${1030}       | ${10}       | ${100}         | ${1042.5264515003064}
    ${1030}       | ${20}       | ${0}           | ${1030}
    ${1030}       | ${20}       | ${50}          | ${1036.0252692857928}
    ${1030}       | ${20}       | ${100}         | ${1042.0959296392145}
  `(
    "should convert local pressure=$localPressure to MSLP=$expectedMeanSeaLevelPressure when T=$temperature,H=$localElevation",
    ({
      localPressure,
      localElevation,
      temperature,
      expectedMeanSeaLevelPressure
    }: {
      localPressure: number;
      localElevation: number;
      temperature: number;
      expectedMeanSeaLevelPressure: number;
    }) => {
      const meanSeaLevelPressure = calculateMeanSeaLevelPressure(
        { localPressure, temperature },
        localElevation
      );

      expect(meanSeaLevelPressure).toEqual(expectedMeanSeaLevelPressure);
    }
  );
});
