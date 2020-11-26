import { parsePitch } from './../note-pitch';

interface TestCase {
  pitchString: string;
  expectedResult: ReturnType<typeof parsePitch>;
}

export const notePitchTestCases: TestCase[] = [
  {
    pitchString: 'foo',
    expectedResult: {
      isValid: false,
      prefix: '',
      accidental: '',
      octave: 0
    }
  },
  {
    pitchString: 'f',
    expectedResult: {
      isValid: true,
      prefix: 'f',
      accidental: '',
      octave: 0
    }
  },
  {
    pitchString: 'f1',
    expectedResult: {
      isValid: true,
      prefix: 'f',
      accidental: '',
      octave: 1
    }
  },
  {
    pitchString: 'f#2',
    expectedResult: {
      isValid: true,
      prefix: 'f',
      accidental: '#',
      octave: 2
    }
  },
  {
    pitchString: 'C',
    expectedResult: {
      isValid: true,
      prefix: 'c',
      accidental: '',
      octave: -1
    }
  },
  {
    pitchString: 'D1',
    expectedResult: {
      isValid: true,
      prefix: 'd',
      accidental: '',
      octave: -2
    }
  },
  {
    pitchString: 'Eb',
    expectedResult: {
      isValid: true,
      prefix: 'e',
      accidental: 'b',
      octave: -1
    }
  },
  {
    pitchString: 'b1',
    expectedResult: {
      isValid: true,
      prefix: 'h',
      accidental: 'b',
      octave: 1
    }
  },
  {
    pitchString: 'bb',
    expectedResult: {
      isValid: false,
      prefix: '',
      accidental: '',
      octave: 0
    }
  },
  {
    pitchString: 'b#2',
    expectedResult: {
      isValid: false,
      prefix: '',
      accidental: '',
      octave: 0
    }
  }

];

type scientificPitchTestCase = {
  pitch: string,
  expectedResult: number | undefined
};

export const scientificPitchTestCases: scientificPitchTestCase[] = [
  { pitch: 'c1', expectedResult: 0},
  { pitch: 'c#1', expectedResult: 1},
  { pitch: 'c', expectedResult: -12},
  { pitch: 'gb1', expectedResult: 6},
  { pitch: 'foo', expectedResult: undefined}
];

type staffPositionTestCase = scientificPitchTestCase;

export const staffPositionTestCases: { clef: string, testCases: staffPositionTestCase[] }[] = [
  {
    clef: 'g',
    testCases: [
      { pitch: 'c1', expectedResult: -6},
      { pitch: 'c#1', expectedResult: -6},
      { pitch: 'h1', expectedResult: 0},
      { pitch: 'gb1', expectedResult: -2},
      { pitch: 'c2', expectedResult: 1},
      { pitch: 'c3', expectedResult: 8},
      { pitch: 'foo', expectedResult: undefined}
    ]
  }
];
