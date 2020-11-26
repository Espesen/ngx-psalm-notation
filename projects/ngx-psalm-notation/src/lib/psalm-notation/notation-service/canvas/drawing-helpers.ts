import { SVGObjects } from './svg-objects';
import { getStaffPosition } from './../symbol/note-pitch';
import { Staff, StaffObject, StaffNote, HalfBarline } from './../staff/staff';

export interface LedgerLine {
  xPos: number;
  yPos: number;
  width: number;
}

type getPositionOptions = { scaledCursorPosition: number, pitch: string, staff: Staff };
type positionReturnValue = { xPos: number, yPos: number };

const getPosition = (
    options: getPositionOptions,
    additionalOptions: {
      staffLineValue: number,
      shiftRight?: number
    }
  ): positionReturnValue => {
    const { staff, pitch } = options;
    const shiftRight = additionalOptions.shiftRight || 0;
    const { staffLineValue } = additionalOptions;
    return {
      xPos: staff.xPos + options.scaledCursorPosition + shiftRight * staff.scale,
      yPos: staff.yPos + (staffLineValue - getStaffPosition(pitch)) * staff.getLineSpacing() / 2
    };
  };

class DrawingHelpers {

  /**
   * Helper method to determine how much to move cursor
   * @param renderedObject object that was just drawn
   */
  calculateCursorMovement(staff: Staff, renderedObject: StaffObject): number {
    const defaults = {
      quarterNote: 20,
      brevis: 30,
      halfBarline: SVGObjects.halfBarline.extraSpacing
    };
    const scale = staff.scale;

    if (renderedObject instanceof StaffNote) {
      return renderedObject.note.duration === 'quarterNote' ?
        defaults.quarterNote * scale :
        defaults.brevis * scale;
    }

    if (renderedObject instanceof HalfBarline) {
      return defaults.halfBarline * scale;
    }

    return 0;
  }

  /**
   *
   * @param options.xDelta needed to shift the ledger lines if there's an accidental -- is absolute
   */
  getNecessaryLedgerLines(options: {
    staff: Staff,
    renderedNote: StaffNote,
    cursorPosition: number,
    xDelta: number
  }): LedgerLine[] {

    const { staff, renderedNote, cursorPosition } = options;

    const getStartingPositions = (where: 'above' | 'below'): { xPos: number, yPos: number } => {
      const xPosDelta = renderedNote.note.duration === 'brevis' ? 0.5 * staff.scale : -1.1 * staff.scale;
      const xPos = staff.xPos + cursorPosition + xPosDelta + options.xDelta;
      const yPos = where === 'below' ?
        staff.yPos + staff.getLineSpacing() * 5 :
        staff.yPos - staff.getLineSpacing();
      return { xPos, yPos };
    };

    const getLedgerLineYPosition = (startingPosition: number, quantifier: number): number => {
      return startingPosition + staff.getLineSpacing() * quantifier;
    };

    const getLedgerLineWidth = (): number => renderedNote.note.duration === 'quarterNote' ?
      20 * staff.scale :
      26 * staff.scale;

    const addLedgerLinesBelowStaff = (numberOfLines: number): LedgerLine[] => {
      const { xPos, yPos: startingYPos } = getStartingPositions('below');
      const lines = [];
      for (let i = 0; i < numberOfLines; i++) {
        lines.push({
          xPos,
          yPos: getLedgerLineYPosition(startingYPos, i),
          width: getLedgerLineWidth()
        } as LedgerLine);
      }
      return lines;
    };

    const addLedgerLinesAboveStaff = (numberOfLines: number): LedgerLine[] => {
      const { xPos, yPos: startingYPos } = getStartingPositions('above');
      const lines = [];
      for (let i = 0; i < numberOfLines; i++) {
        lines.push({
          xPos,
          yPos: getLedgerLineYPosition(startingYPos, -1 * i),
          width: getLedgerLineWidth()
        } as LedgerLine);
      }
      return lines;
    };

    const staffPosition = getStaffPosition(options.renderedNote.note.pitch);
    if (staffPosition < -5) {
      return addLedgerLinesBelowStaff(Math.floor((-4 - staffPosition) / 2));
    } else {
      return staffPosition < 6 ? [] : addLedgerLinesAboveStaff(Math.floor((staffPosition - 4) / 2));
    }
  }

  /**
   *
   * @param options.scaledCursorPosition with scale factor, not staff position accounted for
   */
  getAccidentalPosition(options: getPositionOptions): positionReturnValue {
    return getPosition(options, { staffLineValue: 4 });
  }

  getAccentPosition(options: getPositionOptions): positionReturnValue {
    return getPosition(options, { staffLineValue: 2 });
  }

  getLeftBracketPosition(options: getPositionOptions): positionReturnValue {
    return getPosition(options, { staffLineValue: 4 });
  }

  getRightBracketPosition(options: getPositionOptions): positionReturnValue {
    return getPosition(
      options,
      {
        staffLineValue: 4,
        shiftRight: SVGObjects.leftBracket.extraSpacing
      }
    );
  }

}

export const drawingHelpers = new DrawingHelpers();
