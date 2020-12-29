import { getLastAccentedSyllables } from './terminal-groups';
import { hyphenationExpectations, hyphenationWithAccentsExpections } from './test/hyphenation-expectations';
import { TestBed } from '@angular/core/testing';

import { HyphenationService } from './hyphenation.service';

describe('HyphenationService', () => {
  let service: HyphenationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HyphenationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('method hyphenate', () => {

    const testCases = hyphenationExpectations;

    it('should hyphenate', () => {
      expect(testCases.length).toBeGreaterThan(0);
      testCases.forEach(testCase => {
        const resultingSyllables = service.hyphenate(testCase.originalText);
        expect(
          resultingSyllables
            .reduce((acc, curr) => acc += curr.slice(-1) === '-' ? curr : curr + ' ', '')
            .trim()
        ).toBe(testCase.hyphenatedTextAsAString, 'hyphenating string ' + testCase.originalText);
        expect(resultingSyllables.length).toBe(testCase.numberOfSyllables, 'wrong number of syllables ' + testCase.originalText);
      });
    });

    it('should handle = sign correctly (verse delimiter)', () => {
      testCases
        .filter(testCase => !!testCase.originalText.match(/=/))
        .forEach(testCase => {
          const result = service.hyphenate(testCase.originalText);
          expect(result.findIndex(hyphen => hyphen === '=')).toBeGreaterThan(-1,
            'should find an isolated = sign on string ' + testCase.originalText);
        });
    });
  });

  describe('method hyphenateWithAccents', () => {
    const testCases = hyphenationWithAccentsExpections;

    it('should find accents', () => {
      testCases.forEach(testCase => {
        const { requestedAccents, originalText } = testCase;
        const result = service.hyphenateWithAccents(testCase.originalText, testCase.requestedAccents);
        expect(result
            .syllables
            .reduce((acc, curr) => acc += curr.slice(-1) === '-' ? curr : curr + ' ', '')
            .trim())
          .toBe(testCase.hyphenatedTextAsAString, 'original string: ' + originalText);
        expect(result.wasTooShort).toBe(testCase.wasTooShort);
        if (!result.wasTooShort) {
          expect(result.accentedIndices.length).toBe(requestedAccents, 'wrong number of accents in ' + originalText);
        } else {
          expect(result.accentedIndices.length).toBeGreaterThan(0, 'should have at least one accented syllable');
        }
        result.accentedIndices.forEach((accentedIndex, arrayIndex) => expect(accentedIndex)
          .toBe(testCase.accentedIndices[arrayIndex], 'wrong accent index in ' + originalText));
      });
    });

  });
});
