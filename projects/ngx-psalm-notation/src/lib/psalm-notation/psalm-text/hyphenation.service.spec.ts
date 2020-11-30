import { hyphenationExpectations } from './test/hyphenation-expectations';
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
        const resultingHyphens = service.hyphenate(testCase.originalText);
        expect(
          resultingHyphens
            .reduce((acc, curr) => acc += curr.slice(-1) === '-' ? curr : curr + ' ', '')
            .trim()
        ).toBe(testCase.hyphenatedTextAsAString, 'hyphenating string ' + testCase.originalText);
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
});
