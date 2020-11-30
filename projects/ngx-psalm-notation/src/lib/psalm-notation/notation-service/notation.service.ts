import { HyphenationService } from './../psalm-text/hyphenation.service';
import { MelodyError } from './../melody-service/psalm-melody-interface';
import { notationDefaultValues } from './default-values';
import { LyricsObject } from './symbol/attached-object';
import { PsalmTextService } from './../psalm-text/psalm-text.service';
import { Staff, StaffNote, HalfBarline } from './staff/staff';
import { Injectable } from '@angular/core';
import { drawing } from './canvas/drawing';
import { RenderedPsalm } from '../psalm-text/rendered-psalm-interface';
import { Note } from './symbol/symbol';

type renderPsalmVerseOptions = {
  melody: string;
  lyrics: string;
  canvasWidth: number
};

type renderPsalmVerseReturnValue = {
  staffs: Staff[],
  requiredHeight: number,
  errors: {
    melodyErrors: MelodyError[],
    textErrors: string[];
  }
};

type RenderedPsalmLine = RenderedPsalm['firstLine'];

@Injectable({
  providedIn: 'root'
})
export class NotationService {

  constructor(
    private psalmTextService: PsalmTextService,
    private hyphenationService: HyphenationService
  ) { }

  private calculateRequiredWidth(staff: Staff): number {
    return drawing.drawObjects(staff, 30).finalCursorPosition;
  }

  renderPsalmStaffs(options: renderPsalmVerseOptions): renderPsalmVerseReturnValue {

    const staffLineSpacing = notationDefaultValues.staffLineSpacing;
    const staffXPosition = 10;
    const upperStaffYPosition = 25;
    const { melody, lyrics, canvasWidth } = options;
    const psalmVerse: RenderedPsalm = this.psalmTextService.renderPsalm({ melody, lyrics });
    const selectedStaffs: Staff[] = [];
    const minimumStaffScale = notationDefaultValues.staff.minimumAutomaticScale;
    const indentation = 20;

    const splitPsalmLine = (psalmLine: RenderedPsalmLine): RenderedPsalmLine['elements'][] => {
      const tenorIndex = psalmLine.elements.findIndex(elem => elem.note.duration === 'brevis');
      const tenorText = psalmLine.elements[tenorIndex].text;
      const tenorPitch = psalmLine.elements[tenorIndex].note.pitch;
      const naturalSplitRegex = /(^.{15,}?[\.\,\?\!])/;
      const capableOfNaturalSplit = !!tenorText.match(naturalSplitRegex);
      const spaceIndexes = tenorText
        .split('')
        .map((char, index) => ({ char, index }))
        .filter(item => item.char === ' ')
        .map(item => item.index)
        .reduce((acc, spaceIndex) => ({
          lastFoundIndex: spaceIndex,
          bestFoundIndex: acc.bestFoundIndex > -1 ?
            acc.bestFoundIndex :
            spaceIndex > 0.65 * tenorText.length ? spaceIndex : -1
        }) , { lastFoundIndex: -1, bestFoundIndex: -1 });
      const splitOnSpaceIndex = spaceIndexes.bestFoundIndex > -1 ?
        spaceIndexes.bestFoundIndex : spaceIndexes.lastFoundIndex;
      const splitByHyphenation = (word: string): [ string, string ] => {
        const syllables = this.hyphenationService.hyphenate(word);
        const splitPoint = Math.round(syllables.length * 0.65);
        const stripHyphens = (arrayOfSyllables: string[]): string => arrayOfSyllables
          .map((s, i, arr) => i < arr.length - 1 ? s.replace(/\-$/, '') : s)
          .join('');
        return [
          stripHyphens(syllables.slice(0, splitPoint)),
          stripHyphens(syllables.slice(splitPoint))
        ];
      };

      const tenorFragments: [ string, string ] = capableOfNaturalSplit ?
        tenorText.split(naturalSplitRegex, 3).slice(-2).map(txt => txt.trim()) as [ string, string ] :
        splitOnSpaceIndex > 0 ?
          [ tenorText.slice(0, splitOnSpaceIndex), tenorText.slice(splitOnSpaceIndex + 1) ] :
          splitByHyphenation(tenorText);

      return [
        psalmLine.elements.slice(0, tenorIndex)
          .concat({
            note: new Note({ pitch: tenorPitch, duration: 'brevis' }),
            text: tenorFragments[0]
          }),
        [{
          note: new Note({ pitch: tenorPitch, duration: 'brevis' }),
          text: tenorFragments[1]
        }].concat(psalmLine.elements.slice(tenorIndex + 1))
      ];
    };

    /** Return either one or two staffs for a line of lyrics. Depends on how much words there are */
    const createStaffsForLyricsLine = (psalmLine: RenderedPsalmLine, allIndented: boolean): Staff[] => {

      type createFn = (psalmLineElements: RenderedPsalmLine['elements'], indented: boolean) => Staff;
      const createAndPopulateStaff: createFn = (psalmLineElements, indented) => {
        const staff = new Staff().setDimensions(indented ? canvasWidth - 20 - indentation : canvasWidth - 20, 1);
        psalmLineElements.forEach(elem =>
          staff.addObject(new StaffNote(elem.note).attachObject(new LyricsObject(elem.text))));
        const requiredWidth = this.calculateRequiredWidth(staff);
        staff.scale = requiredWidth < staff.width - 15 ? 1 : staff.width / requiredWidth * 0.97;
        return staff;
      };

      const oneStaff = createAndPopulateStaff(psalmLine.elements, allIndented);

      return oneStaff.scale < minimumStaffScale ?
        splitPsalmLine(psalmLine).map((partial, index) => createAndPopulateStaff(
          partial,
          allIndented || index === 1)) :
        [ oneStaff ];
    };

    // Create one staff and if text doesn't fit, create several instead.
    const onlyStaff = new Staff().setPosition(staffXPosition, upperStaffYPosition)
      .setDimensions(canvasWidth - 20, 1);

    if (psalmVerse.isValid) {
      psalmVerse.firstLine.elements.forEach(elem => {
        onlyStaff.addObject(new StaffNote(elem.note).attachObject(new LyricsObject(elem.text)));
      });
      onlyStaff.addObject(new HalfBarline());
      psalmVerse.secondLine.elements.forEach(elem => {
        onlyStaff.addObject(new StaffNote(elem.note).attachObject(new LyricsObject(elem.text)));
      });

      const onlyStaffRequiredWith = this.calculateRequiredWidth(onlyStaff);

      // if text fits on one staff...
      if ( onlyStaffRequiredWith < onlyStaff.width - 15) {
        onlyStaff.width = onlyStaffRequiredWith + 10;
        selectedStaffs.push(onlyStaff);

      // otherwise, try to scale down the staff...
      } else {
        onlyStaff.scale = onlyStaff.width / this.calculateRequiredWidth(onlyStaff) * 0.97;

        // if the staff would be too small, divide text on two or more staffs
        if (onlyStaff.scale < minimumStaffScale) {
          selectedStaffs.push(
            ...createStaffsForLyricsLine(psalmVerse.firstLine, false),
            ...createStaffsForLyricsLine(psalmVerse.secondLine, true)
          );
          selectedStaffs.forEach(staff => {
            const requiredWidth = this.calculateRequiredWidth(staff);
            staff.width = requiredWidth + 10;
          });
        } else {
          selectedStaffs.push(onlyStaff);
        }
      }
    }

    // calculate space requirements and position staffs

    interface Accumulator {
      requiredHeight: number;
      nextStaffYPosition: number;
    }

    const calculateStaffRequiredHeight: (staff: Staff) => number = staff =>
      staffLineSpacing * 10 * staff.scale;

    type reduceFn = (accumulator: Accumulator, staff: Staff, index: number) => Accumulator;

    const reduceFunction: reduceFn = (accumulator, staff, index) => {
      const xPosition = index === 0 ? staffXPosition : staffXPosition + indentation;
      staff.setPosition(xPosition, accumulator.nextStaffYPosition);
      const nextStaffYPosition = accumulator.nextStaffYPosition + calculateStaffRequiredHeight(staff);
      return {
        requiredHeight: nextStaffYPosition + 25,
        nextStaffYPosition
      };
    };

    const reduceFirstValue: Accumulator = { requiredHeight: 0, nextStaffYPosition: upperStaffYPosition };

    const { requiredHeight } = selectedStaffs
      .reduce(reduceFunction, reduceFirstValue);

    // const requiredHeight = selectedStaffs
    //   .reduce((acc, curr) => acc + staffLineSpacing * 9 * curr.scale, upperStaffYPosition);

    return {
      staffs: selectedStaffs,
      requiredHeight,
      errors: {
        melodyErrors: psalmVerse.melodyErrors,
        textErrors: psalmVerse.textErrors
      }
    };
  }

}
