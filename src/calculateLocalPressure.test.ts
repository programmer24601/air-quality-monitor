import { describe, expect, test } from "vitest";
import { calculateLocalPressure } from "./calculateLocalPressure";

describe("calculateLocalPressure", () => {
  test.each`
    meanSeaLevelPressure | temperature | localElevation | expectedLocalPressure
    ${996}               | ${22.52}    | ${60}          | ${989.11}
    ${990}               | ${0}        | ${0}           | ${990}
    ${990}               | ${0}        | ${50}          | ${983.82}
    ${990}               | ${0}        | ${100}         | ${977.67}
    ${990}               | ${10}       | ${0}           | ${990}
    ${990}               | ${10}       | ${50}          | ${984.04}
    ${990}               | ${10}       | ${100}         | ${978.1}
    ${990}               | ${20}       | ${0}           | ${990}
    ${990}               | ${20}       | ${50}          | ${984.24}
    ${990}               | ${20}       | ${100}         | ${978.51}
    ${1010}              | ${0}        | ${0}           | ${1010}
    ${1010}              | ${0}        | ${50}          | ${1003.7}
    ${1010}              | ${0}        | ${100}         | ${997.42}
    ${1010}              | ${10}       | ${0}           | ${1010}
    ${1010}              | ${10}       | ${50}          | ${1003.92}
    ${1010}              | ${10}       | ${100}         | ${997.86}
    ${1010}              | ${20}       | ${0}           | ${1010}
    ${1010}              | ${20}       | ${50}          | ${1004.13}
    ${1010}              | ${20}       | ${100}         | ${998.28}
    ${1030}              | ${0}        | ${0}           | ${1030}
    ${1030}              | ${0}        | ${50}          | ${1023.57}
    ${1030}              | ${0}        | ${100}         | ${1017.17}
    ${1030}              | ${10}       | ${0}           | ${1030}
    ${1030}              | ${10}       | ${50}          | ${1023.8}
    ${1030}              | ${10}       | ${100}         | ${1017.62}
    ${1030}              | ${20}       | ${0}           | ${1030}
    ${1030}              | ${20}       | ${50}          | ${1024.01}
    ${1030}              | ${20}       | ${100}         | ${1018.04}
  `(
    "should convert MSLP=$meanSeaLevelPressure to pressure=$expectedLocalPressure when T=$temperature,H=$localElevation",
    ({
      meanSeaLevelPressure,
      localElevation,
      temperature,
      expectedLocalPressure
    }: {
      meanSeaLevelPressure: number;
      localElevation: number;
      temperature: number;
      expectedLocalPressure: number;
    }) => {
      const localPressure = calculateLocalPressure(
        meanSeaLevelPressure,
        localElevation,
        temperature
      );

      expect(localPressure).toEqual(expectedLocalPressure);
    }
  );
});
