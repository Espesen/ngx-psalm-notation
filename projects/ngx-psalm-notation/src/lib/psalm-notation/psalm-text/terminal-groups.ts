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

/**
 * Return indices of last accented syllables of an array of syllables
 * @param syllables array of syllables, e.g. ['Her-', 'ra', 'on', 'mi-', 'nun', 'pai-', 'me-', 'ne-', 'ni'];
 * @param howMany number of syllables to return
 */
export const getLastAccentedSyllables: (x: string[], y: number) => number[] = (syllables, howMany) => {
  const wordBeginnings = [0].concat(syllables
    .map((syllable, index, array) => syllable.match(/[^\-]$/) && index < array.length - 2 ?
      index + 1 : -1)
    .filter(item => item > -1));

  const reduceFn: (a: number[], b: number, c: number, d: number[]) => number[] = (acc, curr, index, arr) => {
    const nextIndex = index < arr.length - 1 ? arr[index + 1] : syllables.length;
    const gap = nextIndex - curr;
    return gap < 4 ? acc.concat(curr) : acc.concat([curr, curr + Math.floor(gap / 2), nextIndex].reduce(reduceFn, []).slice(0, -1));
  };

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
    .reduce(reduceFn, [])
    .slice(-1 * howMany);
};

export const getTerminalGroups = (options: getTerminalGroupsOptions): returnType => {

  const { syllables, psalmody } = options;
  let notEnoughSyllables = false;
  let terminalGroupSliceValue: number;

  const accentedSyllableIndices = getLastAccentedSyllables(syllables, psalmody.terminalGroups.length);
  if (syllables.length < 3) {
    notEnoughSyllables = true;
    return { psalmNotes: [], notEnoughSyllables };
  }
  // if there are very few syllables, use only the last terminal group
  if (accentedSyllableIndices[0] < 2) {
    terminalGroupSliceValue = -1;
  } else {
    terminalGroupSliceValue = -1 * psalmody.terminalGroups.length;
  }

  const syllableGroupLengths = accentedSyllableIndices.slice(terminalGroupSliceValue)
    .map((syllableIndex, index, array) => index < array.length - 1 ?
      array[index + 1] - syllableIndex :
      syllables.length - syllableIndex);

  return {
    psalmNotes: psalmody.terminalGroups
      .slice(terminalGroupSliceValue)
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
          text: syllables.splice(accentedSyllableIndices.slice(terminalGroupSliceValue)[0], 1)[0]
        }));
      })
      .reduce((acc, curr) => acc.concat(curr), []),
    notEnoughSyllables
  };
};
