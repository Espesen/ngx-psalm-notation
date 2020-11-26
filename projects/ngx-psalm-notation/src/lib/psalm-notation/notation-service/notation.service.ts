import { MelodyError } from './../melody-service/psalm-melody-interface';
import { notationDefaultValues } from './default-values';
import { LyricsObject } from './symbol/attached-object';
import { PsalmTextService } from './../psalm-text/psalm-text.service';
import { Staff, StaffNote, HalfBarline } from './staff/staff';
import { Injectable } from '@angular/core';
import { drawing } from './canvas/drawing';
import { RenderedPsalm } from '../psalm-text/rendered-psalm-interface';

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

@Injectable({
  providedIn: 'root'
})
export class NotationService {

  constructor(
    private psalmTextService: PsalmTextService
  ) { }

  private calculateRequiredWidth(staff: Staff): number {
    return drawing.drawObjects(staff, 30).finalCursorPosition;
  }

  renderPsalmStaffs(options: renderPsalmVerseOptions): renderPsalmVerseReturnValue {

    const staffLineSpacing = notationDefaultValues.staffLineSpacing;
    const upperStaffYPosition = 25;
    const { melody, lyrics, canvasWidth } = options;
    const psalmVerse: RenderedPsalm = this.psalmTextService.renderPsalm({ melody, lyrics });
    const selectedStaffs: Staff[] = [];

    // Create three staffs and decide later which ones to use
    const onlyStaff = new Staff().setPosition(10, upperStaffYPosition)
      .setDimensions(canvasWidth - 20, 1);
    const upperStaff = new Staff().setPosition(10, upperStaffYPosition)
      .setDimensions(canvasWidth - 20, 1);
    const lowerStaff = new Staff().setDimensions(canvasWidth - 40, 1);

    if (psalmVerse.isValid) {
      psalmVerse.firstLine.elements.forEach(elem => {
        onlyStaff.addObject(new StaffNote(elem.note).attachObject(new LyricsObject(elem.text)));
        upperStaff.addObject(new StaffNote(elem.note).attachObject(new LyricsObject(elem.text)));
      });
      onlyStaff.addObject(new HalfBarline());
      psalmVerse.secondLine.elements.forEach(elem => {
        onlyStaff.addObject(new StaffNote(elem.note).attachObject(new LyricsObject(elem.text)));
        lowerStaff.addObject(new StaffNote(elem.note).attachObject(new LyricsObject(elem.text)));
      });

      if (this.calculateRequiredWidth(onlyStaff) < onlyStaff.width) {
        onlyStaff.width = this.calculateRequiredWidth(onlyStaff) + 10;
        selectedStaffs.push(onlyStaff);
      } else {
        const upperStaffRequiredWidth = this.calculateRequiredWidth(upperStaff);
        const lowerStaffRequiredWidth = this.calculateRequiredWidth(lowerStaff);
        upperStaff.scale = upperStaffRequiredWidth < upperStaff.width ?
          1 :
          0.99 * upperStaff.width / upperStaffRequiredWidth;
        upperStaff.width = upperStaffRequiredWidth + 10;
        lowerStaff.scale = lowerStaffRequiredWidth < lowerStaff.width ?
          1 :
          0.99 * lowerStaff.width / lowerStaffRequiredWidth;
        lowerStaff.width = lowerStaffRequiredWidth + 10;
        selectedStaffs.push(upperStaff);
        selectedStaffs.push(lowerStaff);
        lowerStaff.setPosition(30, upperStaffYPosition + 10 * staffLineSpacing * upperStaff.scale);
      }
    }

    const requiredHeight = selectedStaffs
      .reduce((acc, curr) => acc + staffLineSpacing * 9 * curr.scale, upperStaffYPosition);

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
