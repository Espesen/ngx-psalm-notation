
import { notePitchTestCases, scientificPitchTestCases, staffPositionTestCases } from './note-pitch-test-cases';
import { parsePitch, getScientificPitch, getStaffPosition } from '../note-pitch';

describe('note-pitch.ts', () => {

  describe('parsePitch', () => {

    const testCases: typeof notePitchTestCases = notePitchTestCases;

    it('should be able to parse pitch', () => {
      testCases.forEach(testCase => {
        const result = parsePitch(testCase.pitchString);
        const explanation = 'in test case ' + testCase.pitchString;
        expect(result.isValid).toBe(testCase.expectedResult.isValid, explanation);
        expect(result.prefix).toBe(testCase.expectedResult.prefix, explanation);
        expect(result.accidental).toBe(testCase.expectedResult.accidental, explanation);
        expect(result.octave).toBe(testCase.expectedResult.octave, explanation);
      });
    });

  });

  describe('getScientificPitch', () => {

    const testCases: typeof scientificPitchTestCases = scientificPitchTestCases;
    it('should be able to return scientific pitch', () => {
      testCases.forEach(testCase => {
        const result = getScientificPitch(testCase.pitch);
        const explanation = 'in test case ' + testCase.pitch;
        expect(result).toBe(testCase.expectedResult, explanation);
      });

    });
  });

  describe('getStaffPosition', () => {

    const clefs = staffPositionTestCases.map(item => item.clef);

    clefs.forEach(clef => it('should be able to return staff position on clef ' + clef, () => {
      const testCases = staffPositionTestCases.find(item => item.clef === clef).testCases;
      testCases.forEach(testCase => {
        const result = getStaffPosition(testCase.pitch, 'g');
        const explanation = 'in test case ' + testCase.pitch;
        expect(result).toBe(testCase.expectedResult, explanation);
      });
    }));
  });
});
