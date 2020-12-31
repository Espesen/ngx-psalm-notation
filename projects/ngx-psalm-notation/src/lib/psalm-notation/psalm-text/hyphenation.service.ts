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

    type Context = { previousSyllable: string, nextSyllable: string };
    type Exception = { syllable: string, replace: string[], context?: Context };
    const exceptions: Exception[] = [
      { syllable: 'älä', replace: ['ä', 'lä']},
      { syllable: 'näön', replace: ['nä', 'ön']},
      { syllable: 'nia', replace: ['ni', 'a']},
      { syllable: 'pusi', replace: ['pu', 'si']},
      { syllable: 'sian', replace: ['si', 'an'], context: { previousSyllable: 'hoo', nextSyllable: 'na'}},
      { syllable: 'sian', replace: ['si', 'an'], context: { previousSyllable: 'mor', nextSyllable: '*'}}
    ];

    /** Helper function for case insensitive match with punctuation */
    const customMatch: (a: string, b: string) => boolean = (a, b) => !!a.match(
      new RegExp('^' + b + '[.,:;?!]?\\s?$', 'i')
    );

    const getFindFn = (syllable: string) => (exc: Exception) => customMatch(syllable, exc.syllable);

    const replaceFn = (originalSyllable: string, context: Context): string[] => {
      const matchingExceptions = exceptions.filter(e => customMatch(originalSyllable, e.syllable));
      const isUpperCase = !!originalSyllable.match(/^[A-ZÅÄÖ]/);
      const punctuationMatch = originalSyllable.match(/([.,?!;:]?\s?)$/);
      const originalPunctuation = punctuationMatch ? punctuationMatch[1] : '';
      const addPunctuationToLast = (syll: string, i: number, arr: string[]) => i === arr.length - 1 ? syll + originalPunctuation : syll;
      const matchContext: (a: Context, b: Context) => boolean = (a, exceptionContext) => {
        const previousMatch = exceptionContext.previousSyllable === '*' ||
          customMatch(a.previousSyllable, exceptionContext.previousSyllable);
        const nextMatch = exceptionContext.nextSyllable === '*' ||
          customMatch(a.nextSyllable, exceptionContext.nextSyllable);
        return previousMatch && nextMatch;
      };

      let exc: Exception;
      let replacement: string[];

      // Loop through possible exceptions
      // tslint:disable-next-line:prefer-for-of
      for (let i = 0; i < matchingExceptions.length; i++) {
        exc = matchingExceptions[i];
        replacement = !exc.context ?
          exc.replace.map(addPunctuationToLast) :
          matchContext(context, exc.context) ?
            exc.replace.map(addPunctuationToLast) :
            [ originalSyllable ];
        // if match was found, break out of loop
        if (replacement.length > 1) {
          i = matchingExceptions.length;
        }
      }

      return isUpperCase ?
        replacement.map((syll, i) => i === 0 ? syll.charAt(0).toUpperCase() + syll.slice(1) : syll) :
        replacement;
    };

    const replaceExceptions = (acc: string[], syllable: string, index: number, syllablesArray: string[]): string[] => exceptions
      .find(getFindFn(syllable)) ?
        acc.concat(...replaceFn(syllable, {
          previousSyllable: acc.slice(-1)[0] || '',
          nextSyllable: syllablesArray[index + 1] || ''
        })) :
        acc.concat(syllable);

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
