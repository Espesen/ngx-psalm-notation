import { PsalmMelody } from './../melody-service/psalm-melody-interface';
import { MelodyService } from './../melody-service/melody.service';
import { HyphenationService } from './hyphenation.service';
import { RenderedPsalm } from './rendered-psalm-interface';
import { Injectable } from '@angular/core';
import { getTerminalGroups } from './terminal-groups';

@Injectable({
  providedIn: 'root'
})
export class PsalmTextService {

  constructor(
    private hyphenation: HyphenationService,
    private melodyService: MelodyService
  ) { }

  /**
   * Combine melody and lyrics to a psalm verse.
   *
   * @param options.lyrics either a string that will be hyphenated ar array of syllables.
   */
  renderPsalm(options: { melody: string, lyrics: string | string[] }): RenderedPsalm {
    const { lyrics, melody } = options;
    const syllables: string[] = lyrics instanceof Array ? lyrics : this.hyphenation.hyphenate(lyrics);

    let isValid = true;
    const textErrors: string[] = [];
    let firstLine: RenderedPsalm['firstLine'];
    let secondLine: RenderedPsalm['secondLine'];

    const melodyAnalysis = this.melodyService.analyzePsalmMelody(melody);

    if (!melodyAnalysis.isValid) {
      isValid = false;
    }

    const verseLimiterIndex = syllables.findIndex(syllable => syllable === '=');
    if (verseLimiterIndex < 0) {
      isValid = false;
      textErrors.push('Tekstissä pitää olla kaksi säettä');
    }

    // only continue if melody and words are ok
    if (isValid) {
      const firstTextLine = syllables.slice(0, verseLimiterIndex);
      const secondTextLine = syllables.slice(verseLimiterIndex + 1);

      const fitSyllablesToMelody = (
        textLine: string[],
        psalmody: PsalmMelody['firstLine']
        ): RenderedPsalm['firstLine'] => {

          type psalmNote = RenderedPsalm['firstLine']['elements'][0];
          const remainingSyllables = [...textLine];
          let notEnoughSyllables = false;
          let tenor: psalmNote;
          let extraNotes: psalmNote[] = [];

          // initium
          const initium: psalmNote[] = psalmody.initium.map(initiumNote => ({
            note: initiumNote,
            text: remainingSyllables.splice(0, 1)[0]
          }));

          // terminating groups

          const terminalGroups = getTerminalGroups({
            syllables: remainingSyllables,
            psalmody
          });

          // extra notes
          if (!terminalGroups.notEnoughSyllables) {
            extraNotes = psalmody.extraNotes.reverse().map(note => ({
              note,
              text: remainingSyllables.splice(-1, 1)[0]
            }))
            .reverse();

          // are there any remaining syllables left?
            if (!remainingSyllables.length) {
              notEnoughSyllables = true;
            } else {
              tenor = {
                note: psalmody.tenor,
                text: remainingSyllables
                  .map(syllable => syllable.slice(-1) === '-' ? syllable.replace(/-$/, '') : syllable + ' ')
                  .join('')
                  .trim()
                  + (remainingSyllables.slice(-1)[0].slice(-1) === '-' ? '-' : '')
              };
            }
          }

          return notEnoughSyllables || terminalGroups.notEnoughSyllables ?
            { notEnoughSyllables: true, elements: [] } :
            { elements: initium.concat(tenor, extraNotes, terminalGroups.psalmNotes) };

        };

      firstLine = fitSyllablesToMelody(firstTextLine, melodyAnalysis.firstLine);
      secondLine = fitSyllablesToMelody(secondTextLine, melodyAnalysis.secondLine);
    }

    if ((firstLine && firstLine.notEnoughSyllables) || (secondLine && secondLine.notEnoughSyllables)) {
      isValid = false;
      textErrors.push('Tekstissä ei ole riittävästi tavuja');
    }

    return {
      isValid,
      firstLine,
      secondLine,
      melodyErrors: melodyAnalysis.errors,
      textErrors,
      originalMelodyString: melody
    };

  }
}
