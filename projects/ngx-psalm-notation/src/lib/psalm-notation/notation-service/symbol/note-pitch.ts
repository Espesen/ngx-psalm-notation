
interface Pitch {
  prefix: string;
  accidental: '#' | 'b' | '';
  octave: number;
  isValid: boolean;
}

/**
 * Parses a pitch string.
 * NB! Supports only single accidentals!
 *
 * a##, ebb, bb and b# are not allowed
 *
 * @param pitch string
 */

export const parsePitch = (pitch: string): Pitch => {
  const re = /^([cCdDeEfFgGaAbBhH])([#b]?)(\d?)$/;
  const match = pitch.match(re);

  const invalidPitch: Pitch = { isValid: false, prefix: '', accidental: '', octave: 0 };

  if (match) {
    let prefix = match[1];
    let accidental = (match[2] || '') as Pitch['accidental'];
    let octave = match[3] ? Number(match[3]) : 0;
    if (prefix.match(/[CDEFGABH]/)) {
      prefix = prefix.toLowerCase();
      octave -= (octave * 2 + 1);
    }

    if (prefix === 'b' && accidental === '') {
      prefix = 'h';
      accidental = 'b';
    }

    return prefix !== 'b' || accidental === '' ? {
      prefix,
      accidental,
      octave,
      isValid: true
    } : invalidPitch;
  } else {
    return invalidPitch;
  }
};

/**
 * Scientific pitch is needed to position notes on staff.
 * 0 represents c1, 1 is c#1, 2 is d etc.
 * -1 is h0, -2 is b0...
 */
export const getScientificPitch = (pitch: string): number | undefined => {
  const parsedPitch = parsePitch(pitch);
  const pitchMapping: Record<string, number> = {
    c: 0,
    d: 2,
    e: 4,
    f: 5,
    g: 7,
    a: 9,
    h: 11
  };

  if (parsedPitch.isValid) {
    const basePitch = pitchMapping[parsedPitch.prefix] + (parsedPitch.octave - 1) * 12;
    if (parsedPitch.accidental) {
      return parsedPitch.accidental === '#' ? basePitch + 1 : basePitch - 1;
    } else {
      return basePitch;
    }
  } else {
    return undefined;
  }
};

type supportedClef = 'g';
/**
 * Returns staff position:
 * 0 is middle staffline, positive numbers are above and negative numbers below
 *
 * NB! Supports only g clef
 * @param pitch string
 */
export const getStaffPosition = (pitch: string, clef: supportedClef = 'g'): number | undefined => {
  const pitchMapping: Record<string, number> = {
    c: -6,
    d: -5,
    e: -4,
    f: -3,
    g: -2,
    a: -1,
    h: 0
  };
  const parsedPitch: Pitch = parsePitch(pitch);
  if (parsedPitch.isValid) {
    return pitchMapping[parsedPitch.prefix] + (parsedPitch.octave - 1) * 7;
  } else {
    return undefined;
  }
};


