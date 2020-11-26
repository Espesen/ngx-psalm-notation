import { drawLyrics } from './drawing-objects/drawing-lyrics';
import { drawHalfBarline } from './drawing-objects/drawing-halfbarline';
import { drawBrackets } from './drawing-objects/drawing-brackets';
import { drawAccent } from './drawing-objects/drawing-accent';
import { Accidental, Accent, Brackets, LyricsObject } from './../symbol/attached-object';
import { getStaffPosition } from './../symbol/note-pitch';
import { drawingHelpers, LedgerLine } from './drawing-helpers';
import { Note } from './../symbol/symbol';
import { SVGObjects } from './svg-objects';
import { Staff, StaffNote, HalfBarline } from './../staff/staff';
import { fabric } from 'fabric';
import { drawAccidental } from './drawing-objects/drawing-accidental';

const setPathProperties = (staff: Staff, object: typeof SVGObjects.breveNote): fabric.Path => {
  const path = new fabric.Path(object.path);
  const totalScaleFactor = object.scaleFactor * staff.scale;
  path.set({
    fill: 'black',
    stroke: 'black',
    left: staff.xPos + object.translateX * totalScaleFactor,
    top: staff.yPos + object.translateY * totalScaleFactor
  });
  path.scale(totalScaleFactor);
  return path;
};

type drawingResult = {
  fabricObjects: fabric.Object[],
  ledgerLines: LedgerLine[],
  finalCursorPosition: number;
};

class Drawing {

  drawStaffLines(staff: Staff): fabric.Line[] {
    const lineSpacing = staff.getLineSpacing();
    const { xPos: x, yPos: y } = staff;
    const lines: fabric.Line[] = [];
    for (let i = 0; i < 5; i++) {
      const line = new fabric.Line(
        [ x, y + i * lineSpacing, x + staff.width, y + i * lineSpacing],
        { stroke: '#000000' });
      lines.push(line);
    }
    return lines;
  }

  drawClef(staff: Staff): fabric.Path {
    const clef = SVGObjects.trebleClef;
    return setPathProperties(staff, clef);
  }

  private drawNote(staff: Staff, note: Note): fabric.Path {
    const noteObject = note.duration === 'quarterNote' ? SVGObjects.quarterNoteWithoutStem : SVGObjects.breveNote;
    return setPathProperties(staff, noteObject);
  }

  /**
   * Draws all objects that have been added to a staff.
   */
  drawObjects(staff: Staff, initialCursorPosition: number): drawingResult {
    const fabricObjects: fabric.Object[] = [];
    let ledgerLines: LedgerLine[] = [];

    let cursorPosition = initialCursorPosition * staff.scale;

    // traverse staff objects
    staff.objects.forEach(staffObject => {

      let extraCursorMovement = 0;
      let lyricsWidth = 0;

      // draw note
      if (staffObject instanceof StaffNote) {
        const notePath = this.drawNote(staff, staffObject.note);
        const notePitch = staffObject.note.pitch;
        const lineSpacing = staff.getLineSpacing();
        /** needed if there's an accidental of parentheses */

        // set note location according to pitch and cursor position
        // must add to existing values (when the note is drawn, it is located in default position)
        notePath.set({
          left: notePath.left + cursorPosition,
          top: notePath.top + getStaffPosition(notePitch) * -1 * lineSpacing / 2
        });

        staffObject.attachedObjects.forEach(attachment => {

          // add accidentals
          if (attachment instanceof Accidental) {

            const accidentalDrawingResult = drawAccidental(
              { staff, accidental: attachment, notePitch, cursorPosition, notePath }
            );
            fabricObjects.push(accidentalDrawingResult.accidentalPath);
            extraCursorMovement += accidentalDrawingResult.extraCursorMovement;
          }

          // add accent
          if (attachment instanceof Accent) {
            fabricObjects.push(drawAccent({ staff, notePitch, cursorPosition }).accentPath);
          }

          // add brackets
          if (attachment instanceof Brackets) {
            const brackets = drawBrackets({ staff, notePitch, cursorPosition, notePath });
            fabricObjects.push(brackets.leftBracketPath);
            fabricObjects.push(brackets.rightBracketPath);
            extraCursorMovement += brackets.extraCursorMovement;
          }

          // add lyrics
          if (attachment instanceof LyricsObject) {
            const lyrics = drawLyrics({ staff, cursorPosition, notePitch, text: attachment.text });
            fabricObjects.push(lyrics.textObject);
            lyricsWidth = lyrics.width;
          }

        });

        // get ledger lines
        ledgerLines = ledgerLines.concat(...drawingHelpers.getNecessaryLedgerLines({
          staff,
          renderedNote: staffObject,
          cursorPosition,
          xDelta: extraCursorMovement || 0
        }));

        fabricObjects.push(notePath);

      }

      // draw halfbarline
      if (staffObject instanceof HalfBarline) {
        const halfBarline = drawHalfBarline({ staff, cursorPosition });
        fabricObjects.push(halfBarline.halfBarlinePath);
      }

      // move the cursor
      const baseCursorMovement = drawingHelpers.calculateCursorMovement(staff, staffObject) + extraCursorMovement;
      cursorPosition += baseCursorMovement > lyricsWidth ? baseCursorMovement : lyricsWidth;
    });
    return { fabricObjects, ledgerLines, finalCursorPosition: cursorPosition };
  }
}

export const drawing = new Drawing();
