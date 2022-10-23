import { calculateMeanSeaLevelPressure } from "./calculateMeanSeaLevelPressure";

describe("calculateLocalPressure", () => {
  test.each`
    localPressure | temperature | localElevation | expectedMeanSeaLevelPressure
    ${990}        | ${0}        | ${0}           | ${990}
    ${983.82}     | ${0}        | ${50}          | ${990}
    ${977.67}     | ${0}        | ${100}         | ${990}
    ${990}        | ${10}       | ${0}           | ${990}
    ${984.04}     | ${10}       | ${50}          | ${990}
    ${978.1}      | ${10}       | ${100}         | ${990}
    ${990}        | ${20}       | ${0}           | ${990}
    ${984.24}     | ${20}       | ${50}          | ${990}
    ${978.51}     | ${20}       | ${100}         | ${990}
    ${1010}       | ${0}        | ${0}           | ${1010}
    ${1003.7}     | ${0}        | ${50}          | ${1010}
    ${997.42}     | ${0}        | ${100}         | ${1010}
    ${1010}       | ${10}       | ${0}           | ${1010}
    ${1003.92}    | ${10}       | ${50}          | ${1010}
    ${997.86}     | ${10}       | ${100}         | ${1010}
    ${1010}       | ${20}       | ${0}           | ${1010}
    ${1004.13}    | ${20}       | ${50}          | ${1010}
    ${998.28}     | ${20}       | ${100}         | ${1010}
    ${1030}       | ${0}        | ${0}           | ${1030}
    ${1023.57}    | ${0}        | ${50}          | ${1030}
    ${1017.17}    | ${0}        | ${100}         | ${1030}
    ${1030}       | ${10}       | ${0}           | ${1030}
    ${1023.8}     | ${10}       | ${50}          | ${1030}
    ${1017.62}    | ${10}       | ${100}         | ${1030}
    ${1030}       | ${20}       | ${0}           | ${1030}
    ${1024.01}    | ${20}       | ${50}          | ${1030}
    ${1018.04}    | ${20}       | ${100}         | ${1030}
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
