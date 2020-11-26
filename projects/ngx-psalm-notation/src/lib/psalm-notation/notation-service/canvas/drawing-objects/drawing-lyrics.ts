import { getStaffPosition } from './../../symbol/note-pitch';
import { notationDefaultValues } from './../../default-values';
import { Staff } from './../../staff/staff';
import { fabric } from 'fabric';
import { scan } from 'rxjs/operators';

type drawLyricsOptions = {
  staff: Staff,
  cursorPosition: number,
  notePitch: string,
  text: string
};

type returnValue = {
  textObject: fabric.Object,
  width: number
};

export const drawLyrics = (options: drawLyricsOptions ): returnValue => {
  const { staff, cursorPosition, notePitch, text = '' } = options;

  const notePosition = getStaffPosition(notePitch);
  const lyricsRelativePositionInStaffLines = notePosition < -5 ? -1 * (notePosition - -6) : 0;

  const textObject = new fabric.Text(text);

  textObject.set({
    left: staff.xPos + cursorPosition,
    top: staff.yPos + staff.getLineSpacing() * (5 + lyricsRelativePositionInStaffLines)
  });

  const scaleFactor = notationDefaultValues.lyricsSizeFactor * staff.scale;
  textObject.scale(scaleFactor);
  const width = textObject.width * scaleFactor + 10 * scaleFactor;
  return { textObject, width };
};
