import { PsalmMelody } from './../melody-service/psalm-melody-interface';
import { Note } from './../notation-service/symbol/symbol';

type renderedPsalmLine = {
  elements: {
    note: Note,
    /** syllable that is attached */
    text: string
  }[],
  /** error: there was not enough syllables to fill the melody */
  notEnoughSyllables?: boolean
};

export interface RenderedPsalm {
  isValid: boolean;
  firstLine: renderedPsalmLine | undefined;
  secondLine: renderedPsalmLine | undefined;
  melodyErrors: PsalmMelody['errors'];
  textErrors: string[];
  originalMelodyString: string;
}
