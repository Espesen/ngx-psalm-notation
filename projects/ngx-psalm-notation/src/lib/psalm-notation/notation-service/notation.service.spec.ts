import { notationDefaultValues } from './default-values';
import { TestBed } from '@angular/core/testing';

import { NotationService } from './notation.service';

describe('NotationService', () => {
  let service: NotationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NotationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('method renderPsalmStaff', () => {

    interface TestCase {
      lyrics: string;
      numberOfStaffs: number;
      canvasWidth?: number;
    }

    const testCases: TestCase[] = [
      { lyrics: 'Kaksi lyhyttä säettä = Ja toinenkin on lyhyt', numberOfStaffs: 2 },
      {
        lyrics: 'Tässä on erittäin pitkä säe, jossa on kaksi eri lausetta = ja toinen on lyhyt',
        numberOfStaffs: 3
      },
      {
        lyrics: 'Tässä lyhyt = mutta toinen säe onkin sitten aivan järjettömän pitkä',
        numberOfStaffs: 3
      },
      {
        lyrics: 'Ja tässä on äärimmäisen pitkä ensimmäinen säe = ja toinenkin on mahdottoman pitkä, ' +
          'sisältäen pari lausetta',
        numberOfStaffs: 4
      },
      {
        lyrics: 'Nämä mahtuu yhdelle = riville hyvin',
        numberOfStaffs: 1,
        canvasWidth: 1000
      }

    ];

    const testMelody = 'a_ *g a = a_ *g f';
    const testCanvasWidth = 359;

    const minimumScale = notationDefaultValues.staff.minimumAutomaticScale;

    it('should never return two staffs with scale lower than ' + minimumScale, () => {
      testCases.forEach(testCase => {
        const { lyrics } = testCase;
        const canvasWidth = testCase.canvasWidth || testCanvasWidth;
        const result = service.renderPsalmStaffs({ lyrics, melody: testMelody, canvasWidth });
        if (result.staffs.length === 2) {
          result.staffs.forEach(staff => {
            expect(staff.scale).toBeGreaterThanOrEqual(minimumScale, 'failed with lyrics ' + lyrics);
          });
        }
      });
    });

    it('should return correct number of staffs', () => {
      testCases.forEach(testCase => {
        const { lyrics, numberOfStaffs } = testCase;
        const canvasWidth = testCase.canvasWidth || testCanvasWidth;
        const result = service.renderPsalmStaffs({ lyrics, melody: testMelody, canvasWidth });
        expect(result.staffs.length).toBe(numberOfStaffs, 'failed with lyrics ' + lyrics);
      });
    });
  });
});
