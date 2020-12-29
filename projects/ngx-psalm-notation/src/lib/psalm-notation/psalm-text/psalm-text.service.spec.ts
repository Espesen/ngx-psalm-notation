import { RenderedPsalm } from './rendered-psalm-interface';
import { melodyErrorExpectations, nicePsalmLyrics, successfulRenderPsalmExpectations } from './test/render-psalm-expectations';
import { TestBed } from '@angular/core/testing';
import { PsalmTextService } from './psalm-text.service';

const niceLyrics = nicePsalmLyrics[0];

describe('PsalmTextService', () => {
  let service: PsalmTextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PsalmTextService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('method renderPsalm', () => {

    it('should find melody errors', () => {
      const testCases = melodyErrorExpectations;
      testCases.forEach(testCase => {
        const explanation = 'string was ' + testCase.melodyString;
        const result = service.renderPsalm({ melody: testCase.melodyString, lyrics: niceLyrics });
        expect(result.isValid).toBeFalsy(explanation);
        expect(result.melodyErrors.length && result.melodyErrors[0].message)
          .toBe(testCase.expectedError, explanation);
      });
    });

    it('should find text errors', () => {
      const notTwoLinesResult = service.renderPsalm({
        melody: successfulRenderPsalmExpectations[0].melody,
        lyrics: 'Tässä on vain yksi säe'
      });
      expect(notTwoLinesResult.textErrors.length).toBe(1, 'should have error if only one text line');
      expect(notTwoLinesResult.textErrors[0]).toBe('Tekstissä pitää olla kaksi säettä');
    });

    it('should find too short psalm line', () => {
      const result = service.renderPsalm({
        lyrics: 'Ensimmäinen säe riittävän pitkä = foo',
        melody: successfulRenderPsalmExpectations[0].melody
      });
      expect(result.isValid).toBeFalsy('isValid should be false');
      expect(result.firstLine && result.firstLine.notEnoughSyllables).toBeFalsy('First line');
      expect(result.secondLine && result.secondLine.notEnoughSyllables).toBeTruthy('Second line');
      expect(result.textErrors.findIndex(error => error === 'Tekstissä ei ole riittävästi tavuja'))
        .toBeGreaterThan(-1, 'should have text error message');
    });

    it('should return correctly rendered psalm lines', () => {
      successfulRenderPsalmExpectations.forEach(testCase => {

        const convertToString = (psalmLine: RenderedPsalm['firstLine']): string => psalmLine ?
          psalmLine.elements
            .map(element => [ element.note.pitch, element.text ? element.text.replace(/\s/g, '_') : '' ].join(' '))
            .join(' ') :
          '';

        const explanation = testCase.lyrics + ' ' + testCase.melody;
        const result = service.renderPsalm({ melody: testCase.melody, lyrics: testCase.lyrics });
        expect(convertToString(result.firstLine)).toBe(testCase.expectedResult.firstLine, explanation);
        expect(convertToString(result.secondLine)).toBe(testCase.expectedResult.secondLine, explanation);
      });
    });
  });
});
