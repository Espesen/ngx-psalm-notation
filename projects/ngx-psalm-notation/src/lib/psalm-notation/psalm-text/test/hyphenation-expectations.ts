type testCase = {
  originalText: string,
  hyphenatedTextAsAString: string,
  numberOfSyllables: number
};

export const hyphenationExpectations: testCase[] = [
  {
    originalText: 'Herra on minun paimeneni',
    hyphenatedTextAsAString: 'Her-ra on mi-nun pai-me-ne-ni',
    numberOfSyllables: 9
  },
  {
    originalText: 'Omilleen',
    hyphenatedTextAsAString: 'O-mil-leen',
    numberOfSyllables: 3
  },
  {
    originalText: 'Rakkauden',
    hyphenatedTextAsAString: 'Rak-kau-den',
    numberOfSyllables: 3
  },
  {
    originalText: 'Kokeilu = Testi',
    hyphenatedTextAsAString: 'Ko-kei-lu = Tes-ti',
    numberOfSyllables: 6
  },
  {
    originalText: 'Ota vaan',
    hyphenatedTextAsAString: 'O-ta vaan',
    numberOfSyllables: 3
  },
  {
    originalText: 'Älä ota',
    hyphenatedTextAsAString: 'Ä-lä o-ta',
    numberOfSyllables: 4
  },
  {
    originalText: 'näön',
    hyphenatedTextAsAString: 'nä-ön',
    numberOfSyllables: 2
  },
  {
    originalText: 'Kunnia',
    hyphenatedTextAsAString: 'Kun-ni-a',
    numberOfSyllables: 3
  },
  {
    originalText: 'Sinun liittosi on iloni',
    hyphenatedTextAsAString: 'Si-nun liit-to-si on i-lo-ni',
    numberOfSyllables: 9
  },
  {
    originalText: 'Ja on se niin',
    hyphenatedTextAsAString: 'Ja on se niin',
    numberOfSyllables: 4
  },
  {
    originalText: 'Toimiiko tavutus jos = ääkkösiä',
    hyphenatedTextAsAString: 'Toi-mii-ko ta-vu-tus jos = ääk-kö-siä',
    numberOfSyllables: 11
  }
];

type testCase_2 = {
  originalText: string;
  hyphenatedTextAsAString: string,
  requestedAccents: number;
  accentedIndices: number[];
  wasTooShort: boolean;
};

export const hyphenationWithAccentsExpections: testCase_2[] = [
  {
    originalText: 'Herra on minun paimeneni',
    hyphenatedTextAsAString: 'Her-ra on mi-nun pai-me-ne-ni',
    requestedAccents: 2,
    accentedIndices: [ 5, 7 ],
    wasTooShort: false
  },
  {
    originalText: 'Herra on minun paimeneni',
    hyphenatedTextAsAString: 'Her-ra on mi-nun pai-me-ne-ni',
    requestedAccents: 1,
    accentedIndices: [ 7 ],
    wasTooShort: false
  },
  {
    originalText: 'Lyhyt',
    hyphenatedTextAsAString: 'Ly-hyt',
    requestedAccents: 2,
    accentedIndices: [ 0 ],
    wasTooShort: true
  },
  {
    originalText: 'alussa, nyt on ja aina',
    hyphenatedTextAsAString: 'a-lus-sa, nyt on ja ai-na',
    requestedAccents: 2,
    accentedIndices: [ 3, 6 ],
    wasTooShort: false
  }
];
