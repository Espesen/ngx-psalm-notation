import { Injectable } from '@angular/core';
import * as Hypher from 'hypher';
import * as finnish from 'hyphenation.fi';

const modifiedFinnish = Object.assign({}, finnish, { leftmin: 1, rightmin: 1 });

const hypher = new Hypher(modifiedFinnish);

@Injectable({
  providedIn: 'root'
})
export class HyphenationService {


  constructor() { }

  hyphenate(text: string): string[] {

    type exception = { syllable: string, replace: string[] };
    const exceptions: exception[] = [
      { syllable: 'älä', replace: ['ä', 'lä']}
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
    const reduceFn = (arr: string[], syllable: string): string[] => exceptions
      .find(getFindFn(syllable)) ?
        arr.concat(...replaceFn(exceptions.find(getFindFn(syllable)), syllable)) :
        arr.concat(syllable);

    return hypher.hyphenate(text)
      .reduce((acc, curr) => acc.concat(...curr.replace(/\s([\S=])/g, '*$1').split('*')
        .map((item, index, array) => index === 0 && array.length > 1 ? item + ' ' : item)), [])
      // remove em dashes
      .filter(item => item !== '–')
      .reduce(reduceFn, [])
      .map((item, index, array) => item
        .match(/[^\s]$/) && index < array.length - 1 ? item + '-' : item.replace(/\s$/, ''))
      .map(item => item.replace('=-', '='));

  }
}
