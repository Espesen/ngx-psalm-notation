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
