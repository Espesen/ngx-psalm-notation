import { Note } from './../notation-service/symbol/symbol';
import { validMelodies, erroneousMelodies, melodyAnalysisExpectations } from './test/analyze-melody-expectations';
import { Accidental } from './../notation-service/symbol/attached-object';
import { StaffNote } from './../notation-service/staff/staff';
import { parseMelodyTest } from './test/parse-melody-expectations';
import { TestBed } from '@angular/core/testing';
import { MelodyService } from './melody.service';

describe('MelodyService', () => {
  let service: MelodyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MelodyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('method parseMelody', () => {
    const testMaterial = parseMelodyTest;

    it('should parse a melody string', () => {
      const result = service.parseMelody(testMaterial.testString);
      expect(result.errors.length).toBe(testMaterial.result.errors.length, 'number of errors');
      expect(result.result.length).toBe(testMaterial.result.result.length, 'number of results');

      result.errors.forEach((error, index) => {
        const explanation = 'at expected errors, index ' + index;
        expect(error.erroneousSymbol).toBe(testMaterial.result.errors[index].erroneousSymbol, explanation);
        expect(error.atIndex).toBe(testMaterial.result.errors[index].atIndex, explanation);
      });

      result.result.forEach((staffObject, index) => {
        const explanation = 'at expected results, index ' + index;
        expect(staffObject.type).toBe(testMaterial.result.result[index].type, explanation);
        if (staffObject instanceof StaffNote) {
          const expectedNote = testMaterial.result.result[index] as StaffNote;
          expect(staffObject.note.pitch).toBe(expectedNote.note.pitch, explanation);
          expect(staffObject.note.duration).toBe(expectedNote.note.duration, explanation);
          expect(staffObject.attachedObjects.length).toBe(expectedNote.attachedObjects.length, explanation);
          staffObject.attachedObjects.forEach((obj, i) => {
            expect(obj.attachedObjectType).toBe(expectedNote.attachedObjects[i].attachedObjectType, explanation);
            if (obj instanceof Accidental) {
              const expectedAccidental = expectedNote.attachedObjects[i] as Accidental;
              expect(obj.modifier).toBe(expectedAccidental.modifier);
            }
          });
        }
      });
    });

  });

  describe('method analyzePsalmMelody', () => {

    it('should analyze valid psalm melodies as valid', () => {
      expect(validMelodies.length).toBeGreaterThan(0);
      validMelodies.forEach(melodyString => {
        const result = service.analyzePsalmMelody(melodyString);
        expect(result.isValid).toBeTruthy();
        expect(result.errors.length).toBe(0);
      });
    });

    it('should find errors', () => {
      erroneousMelodies.forEach(testCase => {
        const explanation = 'in melody ' + testCase.melodyString;
        const result = service.analyzePsalmMelody(testCase.melodyString);
        expect(result.isValid).toBeFalsy();
        expect(result.errors.length).toBe(testCase.expecteErrors.length, 'number of errors in ' + explanation);
        testCase.expecteErrors.forEach(expectedError => {
          const foundError = result.errors.find(err => err.message === expectedError.message);
          expect(foundError).toBeTruthy(explanation + ' should have found error ' + expectedError.message);
          if (foundError) {
            expect(foundError.atIndex).toBe(
              expectedError.atIndex,
              explanation + ' ' + expectedError.message + ' ' + 'should have been at index ' +
                expectedError.atIndex);
          }
        });
      });
    });

    describe('melody analysis', () => {

      const expectations = melodyAnalysisExpectations;

      const joinNotesToString = (notes: Note[]): string => notes
        .map(note => note.hasBrackets ? '(' + note.pitch + ')' : note.pitch)
        .join(' ');

      const getExplanation = (melodyString: string, analysisTarget: string): string => 'While ' +
        'analyzing string ' + melodyString + ' ' + analysisTarget;

      it('should analyze initium', () => {

        expectations.forEach(expectation => {
          const explanation = getExplanation(expectation.melodyString, 'initium');
          const result = service.analyzePsalmMelody(expectation.melodyString);
          const firstLineInitium = joinNotesToString(result.firstLine.initium);
          const secondLineInitium = joinNotesToString(result.secondLine.initium);
          expect(firstLineInitium).toBe(expectation.expectedResult.firstLine.initium, explanation);
          expect(secondLineInitium).toBe(expectation.expectedResult.secondLine.initium, explanation);
        });

      });

      it('should analyze tenor', () => {
        expectations.forEach(expectation => {
          const explanation = getExplanation(expectation.melodyString, 'tenor');
          const result = service.analyzePsalmMelody(expectation.melodyString);
          expect(result.firstLine.tenor.pitch).toBe(expectation.expectedResult.firstLine.tenor, explanation);
          expect(result.secondLine.tenor.pitch).toBe(expectation.expectedResult.secondLine.tenor, explanation);
        });
      });

      it('should analyze extra notes', () => {
        expectations.forEach(expectation => {
          const explanation = getExplanation(expectation.melodyString, 'extra notes');
          const result = service.analyzePsalmMelody(expectation.melodyString);
          const firstLineExtraNotes = joinNotesToString(result.firstLine.extraNotes);
          const secondLineExtraNotes = joinNotesToString(result.secondLine.extraNotes);
          expect(firstLineExtraNotes).toBe(expectation.expectedResult.firstLine.extraNotes, explanation);
          expect(secondLineExtraNotes).toBe(expectation.expectedResult.secondLine.extraNotes, explanation);
        });
      });

      it('should analyze terminal groups', () => {
        expectations.forEach(expectation => {
          const explanation = getExplanation(expectation.melodyString, 'terminal groups');
          const result = service.analyzePsalmMelody(expectation.melodyString);
          const firstLineTerminalGroups: string[] = result.firstLine.terminalGroups
            .map(group => joinNotesToString(group));
          const secondLineTerminalGroups = result.secondLine.terminalGroups
            .map(group => joinNotesToString(group));
          expect(result.firstLine.terminalGroups.length)
            .toBe(expectation.expectedResult.firstLine.terminalGroups.length, explanation);
          expect(result.secondLine.terminalGroups.length)
            .toBe(expectation.expectedResult.secondLine.terminalGroups.length, explanation);
          firstLineTerminalGroups.forEach((group, index) => expect(group)
            .toBe(expectation.expectedResult.firstLine.terminalGroups[index], explanation));
          secondLineTerminalGroups.forEach((group, index) => expect(group)
            .toBe(expectation.expectedResult.secondLine.terminalGroups[index], explanation));
        });

      });

    });
  });
});
