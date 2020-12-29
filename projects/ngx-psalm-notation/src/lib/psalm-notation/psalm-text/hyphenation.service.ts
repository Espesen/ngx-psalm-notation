import { getLastAccentedSyllables } from './terminal-groups';
import { Injectable } from '@angular/core';
import * as Hypher from 'hypher';
import * as finnish from 'hyphenation.fi';

const modifiedFinnish = Object.assign({}, finnish, { leftmin: 1, rightmin: 1 });

const hypher = new Hypher(modifiedFinnish);

/**
 * Hyphenated string with accented syllables at the end
 */
interface HyphenationWithAccents {
  syllables: string[];
  /** Indices of accented syllables */
  accentedIndices: number[];
  /** whether the sentence was too short to find enough accents */
  wasTooShort: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class HyphenationService {


  constructor() { }

  hyphenate(text: string): string[] {

    type exception = { syllable: string, replace: string[] };
    const exceptions: exception[] = [
      { syllable: 'älä', replace: ['ä', 'lä']},
      { syllable: 'näön', replace: ['nä', 'ön']},
      { syllable: 'nia', replace: ['ni', 'a']}
    ];

    const getFindFn = (syllable: string) => (exc: exception) => !!syllable.match(new RegExp(exc.syllable, 'i'));
    const replaceFn = (exc: exception, originalSyllable: string): string[] => {
      const isUpperCase = !!originalSyllable.match(/[A-ZÅÄÖ]/);
      const addSpaceToLast = (syll: string, i: number, arr: string[]) => i === arr.length - 1 ? syll + ' ' : syll;
      return isUpperCase ?
        exc.replace.map((syll, i, arr) => i === 0 ? syll.charAt(0).toUpperCase() + syll.slice(1) : syll)
          .map(addSpaceToLast) :
        exc.replace
          .map(addSpaceToLast);
    };
    const replaceExceptions = (arr: string[], syllable: string): string[] => exceptions
      .find(getFindFn(syllable)) ?
        arr.concat(...replaceFn(exceptions.find(getFindFn(syllable)), syllable)) :
        arr.concat(syllable);

    const splitOnSpaces: (s: string) => string[] = str => str
      .split(/(\s)/)
      .filter(syll => !!syll)
      .reduce((a, b) => b === ' ' ? a.slice(0, -1).concat(a.slice(-1)[0] + ' ') : a.concat(b), []);

    return hypher.hyphenate(text)
      // split on spaces
      .reduce((a, b) => a.concat(...splitOnSpaces(b)), [])
      .reduce((acc, curr) => acc.concat(...curr.replace(/\s([\S=])/g, '*$1').split('*')
        .map((item, index, array) => index === 0 && array.length > 1 ? item + ' ' : item)), [])
      // remove em dashes
      .filter(item => item !== '– ')
      .reduce(replaceExceptions, [])
      .map((item, index, array) => item
        .match(/[^\s]$/) && index < array.length - 1 ? item + '-' : item.replace(/\s$/, ''))
      .map(item => item.replace('=-', '='));

  }

  /**
   * Hyphenate a string and find last accented syllables
   * @param numberOfAccents How many accented syllables to show
   */

  hyphenateWithAccents(text: string, numberOfAccents = 2 ): HyphenationWithAccents {
    const syllables = this.hyphenate(text);
    const accentedIndices = getLastAccentedSyllables(syllables, numberOfAccents);
    return {
      syllables,
      accentedIndices,
      wasTooShort: accentedIndices.length < numberOfAccents
    };
  }
}
