type testCase = {
  originalText: string,
  hyphenatedTextAsAString: string
};

export const hyphenationExpectations: testCase[] = [
  {
    originalText: 'Herra on minun paimeneni',
    hyphenatedTextAsAString: 'Her-ra on mi-nun pai-me-ne-ni'
  },
  {
    originalText: 'Rakkauden',
    hyphenatedTextAsAString: 'Rak-kau-den'
  },
  {
    originalText: 'Kokeilu = Testi',
    hyphenatedTextAsAString: 'Ko-kei-lu = Tes-ti'
  },
  {
    originalText: 'Ota vaan',
    hyphenatedTextAsAString: 'O-ta vaan'
  },
  {
    originalText: 'Älä ota',
    hyphenatedTextAsAString: 'Ä-lä o-ta'
  },
  {
    originalText: 'näön',
    hyphenatedTextAsAString: 'nä-ön'
  },
  {
    originalText: 'Toimiiko tavutus jos = ääkkösiä',
    hyphenatedTextAsAString: 'Toi-mii-ko ta-vu-tus jos = ääk-kö-siä'
  }

];
