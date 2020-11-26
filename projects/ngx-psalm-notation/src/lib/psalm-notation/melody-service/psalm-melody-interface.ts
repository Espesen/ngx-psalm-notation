import { Note, BreveNote } from './../notation-service/symbol/symbol';
type terminalGroup = Note[];

type psalmLine = {
  initium: Note[],
  tenor: BreveNote,
  extraNotes: Note[],
  terminalGroups: terminalGroup[]
};

interface CustomError {
  atIndex: number;
  message: string;
}

export class MelodyError implements CustomError {

  constructor(public atIndex: number, public message: string) {}
}

/**
 * Represents an analysis of a given psalm melody, with validity checks.
 */

export interface PsalmMelody {
  originalString: string;
  isValid: boolean;
  firstLine: psalmLine | undefined;
  secondLine: psalmLine | undefined;
  errors: MelodyError[];
}
