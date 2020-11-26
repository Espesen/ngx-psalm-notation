import { PsalmMelody } from './../melody-service/psalm-melody-interface';
import { RenderedPsalm } from './rendered-psalm-interface';

type psalmNote = RenderedPsalm['firstLine']['elements'][0];



type getTerminalGroupsOptions = {
  syllables: string[],
  psalmody: PsalmMelody['firstLine']
};

type returnType = {
  psalmNotes: psalmNote[],
  notEnoughSyllables: boolean;
};

export const getTerminalGroups = (options: getTerminalGroupsOptions): returnType => {

  const { syllables, psalmody } = options;
  let notEnoughSyllables = false;

  /** return indexes of accented syllables */
  const getLastAccentedSyllables = (howMany: number): number[] => {
    const wordBeginnings = [0].concat(syllables
      .map((syllable, index, array) => syllable.match(/[^\-]$/) && index < array.length - 2 ?
        index + 1 : -1)
      .filter(item => item > -1));

    return wordBeginnings
      .map((wordBeginningIndex, arrayIndex, array) => {

        const wordLength = arrayIndex < array.length - 1 ?
          array[arrayIndex + 1] - wordBeginningIndex :
          syllables.length - wordBeginningIndex;

        return wordLength < 3 ?
          [ wordBeginningIndex ] :
          Array.from(Array(Math.floor(wordLength / 2)).keys())
            .map(delta => wordBeginningIndex + delta * 2);
      })
      .reduce((acc, curr) => acc.concat(...curr), [])
      .filter((syllableIndex, arrayIndex, array) => arrayIndex < array.length - 1 ?
        array[arrayIndex + 1] - syllableIndex > 1 :
        true)
      .reduce((acc, curr, index, arr) => {
        const gap = index < arr.length - 1 ? arr[index + 1] - curr : syllables.length - curr;
        return gap < 4 ? acc.concat(curr) : acc.concat(curr, curr + 2);
      }, [])
      .slice(-1 * howMany);

  };

  const accentedSyllableIndexes = getLastAccentedSyllables(psalmody.terminalGroups.length);

  if (accentedSyllableIndexes.length < psalmody.terminalGroups.length) {
    notEnoughSyllables = true;
    return { psalmNotes: [], notEnoughSyllables };
  }

  const syllableGroupLengths = accentedSyllableIndexes
    .map((syllableIndex, index, array) => index < array.length - 1 ?
      array[index + 1] - syllableIndex :
      syllables.length - syllableIndex);

  return {
    psalmNotes: psalmody.terminalGroups
      .map((notes, index) => {

        if (notes.length > syllableGroupLengths[index]) {
          notes.splice(1, 1);
        } else {
          if (syllableGroupLengths[index] > notes.length) {
            notes.splice(1, 0, notes[1]);
          }
        }

        return notes.map((note, indexInGroup) => ({
          note,
          text: syllables.splice(accentedSyllableIndexes[0], 1)[0]
        }));
      })
      .reduce((acc, curr) => acc.concat(curr), []),
    notEnoughSyllables
  };
};
