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
    originalText: 'Ota',
    hyphenatedTextAsAString: 'O-ta'
  },
  {
    originalText: 'Toimiiko tavutus jos = ääkkösiä',
    hyphenatedTextAsAString: 'Toi-mii-ko ta-vu-tus jos = ääk-kö-siä'
  }

];
