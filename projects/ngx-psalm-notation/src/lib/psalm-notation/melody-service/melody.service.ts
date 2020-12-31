import { BreveNote } from './../notation-service/symbol/symbol';
import { PsalmMelody, MelodyError } from './psalm-melody-interface';
import { Accent, Brackets } from './../notation-service/symbol/attached-object';
import { parsePitch } from './../notation-service/symbol/note-pitch';
import { StaffObject, StaffNote, HalfBarline } from './../notation-service/staff/staff';
import { Injectable } from '@angular/core';
import { Note } from '../notation-service/symbol/symbol';

/**
 * Takes a psalm note pitch string and returns a plain note pitch.
 * First octave number is added.
 * For example: g => g1, (f) => f1, *e => e1
 *
 */
const getPlainNotePitch = (pitch: string): string => pitch
  .replace(/[()*_]/g, '')
  .replace(/[^\d]$/, '$&1');


type ParseError = {
  erroneousSymbol: string;
  atIndex: number;
};

@Injectable({
  providedIn: 'root'
})
export class MelodyService {

  constructor() { }

  /**
   * Parses a raw psalm melody string and converts it to staff objects.
   * Does not validate the melody in any way!
   */
  parseMelody(melodyString: string): { errors: ParseError[], result: StaffObject[] } {
    const errors: ParseError[] = [];
    const result: StaffObject[] = [];
    const stringParticles = melodyString.split(' ');
    stringParticles
      .filter((item, index) => item.length || index > 0)
      .forEach((objectString, index) => {

        // is it a halfbarline?
        if (objectString === '=') {
          result.push(new HalfBarline());
          return;
        }

        // it is a note
        const hasAccent = !!objectString.match(/^\*/);
        const hasBrackets = !!objectString.match(/^\(.+\)$/);
        const isBrevis = !!objectString.match(/_$/);
        const noteString = getPlainNotePitch(objectString);
        const parsedPitch = parsePitch(noteString);
        if (parsedPitch.isValid) {
          const staffNote = new StaffNote(new Note({ pitch: noteString, duration: isBrevis ? 'brevis' : 'quarterNote' }));
          if (hasBrackets) {
            staffNote.attachObject(new Brackets());
          }
          result.push(hasAccent ? staffNote.attachObject(new Accent()) : staffNote);
        } else {
          errors.push({ erroneousSymbol: objectString, atIndex: index });
        }
      });
    return { errors, result };
    }

  analyzePsalmMelody(melodyString: string): PsalmMelody {

    let firstLine: PsalmMelody['firstLine'];
    let secondLine: PsalmMelody['secondLine'];

    let isValid = true;
    const errors: PsalmMelody['errors'] = [];

    // handle extra spaces
    const stringFragments = melodyString.split(' ').filter(str => str.length > 0);

    // detect if there are two psalm lines
    if (stringFragments.indexOf('=') < 0) {
      isValid = false;
      errors.push(new MelodyError(0, 'Psalmimelodiassa tulee olla kaksi säettä'));
    } else {

      // detect the tenors
      let foundTenors = 0;
      for (let i = 0; i < stringFragments.length; i++) {
        if (stringFragments[i] === '=') {
          if (foundTenors === 0) {
            isValid = false;
            errors.push({
              atIndex: i,
              message: 'Kummassakin säkeessä tulee olla täsmälleen yksi resitointisävel'
            });
          }
          foundTenors = 0;
        } else {
          if (stringFragments[i].slice(-1) === '_') {
            foundTenors += 1;
            if (foundTenors === 2) {
              isValid = false;
              errors.push({
                atIndex: i,
                message: 'Kummassakin säkeessä tulee olla täsmälleen yksi resitointisävel'
              });
            }
          }
        }
      }
      if (!foundTenors) {
        isValid = false;
        errors.push({
          atIndex: stringFragments.length - 1,
          message: 'Kummassakin säkeessä tulee olla täsmälleen yksi resitointisävel'
        });
      }
    }

    // find accented notes
    const accentedNoteIndexes: number[] = stringFragments
      .map((item, index) => item.slice(0, 1) === '*' ? index : -1)
      .filter(item => item > 0);
    const tenorIndexes: number[] = stringFragments
      .map((item, index) => item.slice(-1) === '_' ? index : -1)
      .filter(item => item > 0);

    const barlineIndex = stringFragments.findIndex(item => item === '=');
    tenorIndexes.forEach(tenorIndex => {
      let accentedAfterTenorCount;
      if (tenorIndex < barlineIndex) {
        accentedAfterTenorCount = accentedNoteIndexes
          .filter(ind => ind > tenorIndex && ind < barlineIndex)
          .length;
      } else {
        accentedAfterTenorCount = accentedNoteIndexes
          .filter(ind => ind > tenorIndex && ind < stringFragments.length)
          .length;
      }
      if (!accentedAfterTenorCount) {
        isValid = false;
        errors.push({ atIndex: tenorIndex, message: 'Resitointisävelen jälkeen on oltava vähintään yksi painollinen sävel'});
      }
    });

    // analyze accented note positions
    accentedNoteIndexes.forEach(index => {
      if (index === barlineIndex - 1 || index === stringFragments.length - 1) {
        isValid = false;
        errors.push({ atIndex: index, message: 'Painollinen sävel ei voi olla säkeessä viimeisenä' });
      }
    });
    accentedNoteIndexes.forEach((noteIndex, arrayIndex, array) => {

      const checkCondition = (noteIndex < barlineIndex && array[arrayIndex + 1] < barlineIndex) ||
        noteIndex > barlineIndex && arrayIndex < array.length - 1;
      if (checkCondition && (array[arrayIndex + 1] - noteIndex > 3 || array[arrayIndex + 1] - noteIndex < 2)) {
        isValid = false;
        errors.push({ atIndex: noteIndex, message: 'Painollisten sävelten välissä on oltava 1-2 painotonta säveltä'});
      }
    });

    // check if note pitches are correct
    stringFragments.forEach((note, index) => {
      const parsed = parsePitch(getPlainNotePitch(note));
      if (note !== '=' && !parsed.isValid) {
        isValid = false;
        errors.push({ atIndex: index, message: 'Melodiassa on väärin kirjoitettuja nuotteja' });
      }
    });

    // Do the actual analysis only if there are no errors

    if (isValid) {

      const getInitium = (notes: string[]): Note[] => {
        const tenorIndex = notes.findIndex(note => note.slice(-1) === '_');
        return notes
          .slice(0, tenorIndex)
          .map(note => new Note({ pitch: getPlainNotePitch(note), duration: 'quarterNote'}));
      };

      const getTenor = (notes: string[]): BreveNote => {
        return new BreveNote(getPlainNotePitch(notes.find(note => note.slice(-1) === '_')));
      };

      const getExtraNotes = (notes: string[]): Note[] => {
        const tenorIndex = notes.findIndex(note => note.slice(-1) === '_');
        const firstAccentedNoteIndex = notes
          .findIndex((note, index) => note.slice(0, 1) === '*' && index > tenorIndex);
        return notes
          .slice(tenorIndex + 1, firstAccentedNoteIndex)
          .map(pitch => new Note({ pitch: getPlainNotePitch(pitch), duration: 'quarterNote'}));
      };

      const getTerminalGroups = (notes: string[]): PsalmMelody['firstLine']['terminalGroups'] => {
        const indexesOfAccentedNotes = notes
          .map((note, index) => note.slice(0, 1) === '*' ? index : -1)
          .filter(index => index > 0);
        return indexesOfAccentedNotes
          .map((noteIndex, arrayIndex, array) => arrayIndex < array.length - 1 ?
            notes.slice(noteIndex, array[arrayIndex + 1]) :
            notes.slice(noteIndex)
          )
          .map(groupOfNotes => groupOfNotes.map(noteString => {
            const hasBrackets = noteString.slice(0, 1) === '(';
            const note = new Note({
              pitch: getPlainNotePitch(noteString),
              duration: 'quarterNote'
            });
            return hasBrackets ? note.addBrackets() : note;
          }));
      };

      const firstLineNotes = stringFragments.slice(0, barlineIndex);
      const secondLineNotes = stringFragments.slice(barlineIndex + 1);

      firstLine = {
        initium: getInitium(firstLineNotes),
        tenor: getTenor(firstLineNotes),
        extraNotes: getExtraNotes(firstLineNotes),
        terminalGroups: getTerminalGroups(firstLineNotes)
      };
      secondLine = {
        initium: getInitium(secondLineNotes),
        tenor: getTenor(secondLineNotes),
        extraNotes: getExtraNotes(secondLineNotes),
        terminalGroups: getTerminalGroups(secondLineNotes)
      };
    }

    return {
      originalString: melodyString,
      errors,
      firstLine,
      secondLine,
      isValid
    };
  }
}
