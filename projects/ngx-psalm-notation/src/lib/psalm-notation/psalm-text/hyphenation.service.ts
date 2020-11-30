import { Injectable } from '@angular/core';
import * as Hypher from 'hypher';
import * as finnish from 'hyphenation.fi';

const hypher = new Hypher(finnish);

@Injectable({
  providedIn: 'root'
})
export class HyphenationService {


  constructor() { }

  hyphenate(text: string): string[] {

    return hypher.hyphenate(text)
      .reduce((acc, curr) => acc.concat(...curr.replace(/\s([\S=])/g, '*$1').split('*')
        .map((item, index, array) => index === 0 && array.length > 1 ? item + ' ' : item)), [])
      // remove em dashes
      .filter(item => item !== '–')
      .map((item, index, array) => item
        .match(/[^\s]$/) && index < array.length - 1 ? item + '-' : item.replace(/\s$/, ''))
      .map(item => item.replace('=-', '='));

  }
}
