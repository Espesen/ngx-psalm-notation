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
  }

];
