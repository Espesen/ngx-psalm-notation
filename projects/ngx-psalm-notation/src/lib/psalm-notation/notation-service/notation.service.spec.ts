import { ATTACHED_OBJECT_TYPE, LyricsObject } from './symbol/attached-object';
import { StaffNote } from './staff/staff';
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

    interface TenorTestCase {
      verseLyrics: string;
      tenorSplitParts: [[ string, string ], [ string, string ]];
    }

    const tenorTestCases: TenorTestCase[] = [
      { verseLyrics: 'Kohotkaa korkeiksi, portit, avartukaa, ikiaikaiset ovet! = ' +
        'Kirkkauden kuningas tulee.',
        tenorSplitParts: [['kaa korkeiksi, portit,', 'avartukaa, ikiaikaiset'], ['Kirkkauden', 'kunin-']]
      },
      {
        verseLyrics: 'Minä kuuntelen, mitä Herra Jumala puhuu. Hän lupaa rauhan kansalleen, omilleen – = ' +
          'älkööt he enää eksykö mielettömyyteen!',
        tenorSplitParts: [['kuuntelen, mitä Herra Jumala puhuu.', 'Hän lupaa rauhan kansalleen,'],
          ['älkööt he enää eksykö', 'mie-']]
      },
      {
        verseLyrics: 'Testi sulkapallomailakassi = tämä testaa äärimmäisen pitkän yhdyssanan lyhentämistä',
        tenorSplitParts: [['sulkapallo-', 'maila-'], ['tämä testaa äärimmäisen pitkän', 'yhdyssanan ly-']]
      }
    ];

    const tenorTestMelody = 'f g a_ *g a = a_ g *a f';

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

    it('should split tenor correctly', () => {

      tenorTestCases.forEach(testCase => {
        const { verseLyrics: lyrics, tenorSplitParts } = testCase;
        const result = service.renderPsalmStaffs({ lyrics, melody: tenorTestMelody, canvasWidth: 100 });
        expect(result.staffs.length).toBe(4, 'It should have split both lines');
        const firstLineStaffs = result.staffs.slice(0, 2);
        const secondLineStaffs = result.staffs.slice(2);

        const getLyrics = (note: StaffNote) => note.attachedObjects
          .filter(obj => obj.attachedObjectType === ATTACHED_OBJECT_TYPE.lyrics)
          .reduce((txt, lyricsObj) => (lyricsObj as LyricsObject).text, '');
        const firstTenorBeginning = getLyrics(firstLineStaffs[0].objects.slice(-1)[0] as StaffNote);
        const firstTenorEnd = getLyrics(firstLineStaffs[1].objects.slice(0, 1)[0] as StaffNote);
        const secondTenorBeginning = getLyrics(secondLineStaffs[0].objects.slice(-1)[0] as StaffNote);
        const secondTenorEnd = getLyrics(secondLineStaffs[1].objects.slice(0, 1)[0] as StaffNote);

        expect(firstTenorBeginning).toBe(testCase.tenorSplitParts[0][0], ' on lyrics ' + lyrics);
        expect(firstTenorEnd).toBe(testCase.tenorSplitParts[0][1], ' on lyrics ' + lyrics);
        expect(secondTenorBeginning).toBe(testCase.tenorSplitParts[1][0], ' on lyrics ' + lyrics);
        expect(secondTenorEnd).toBe(testCase.tenorSplitParts[1][1], ' on lyrics ' + lyrics);


      });
    });
  });
});
