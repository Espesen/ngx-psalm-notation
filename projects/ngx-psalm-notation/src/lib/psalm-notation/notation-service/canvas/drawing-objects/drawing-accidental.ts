import { Accidental } from './../../symbol/attached-object';
import { Staff } from './../../staff/staff';
import { drawingHelpers } from './../drawing-helpers';
import { SVGObjects } from './../svg-objects';
import { fabric } from 'fabric';

type arguments = {
  staff: Staff,
  accidental: Accidental,
  cursorPosition: number,
  notePitch: string,
  /** fabric.Path of the already drawn note */
  notePath: fabric.Path
};

type returnValue = {
  accidentalPath: fabric.Path,
  extraCursorMovement: number;
};

export const drawAccidental = (options: arguments): returnValue => {

  const { staff, accidental, notePitch: pitch, cursorPosition, notePath } = options;
  const accidentalObject: typeof SVGObjects.sharp = accidental.modifier === 'sharp' ?
    SVGObjects.sharp : SVGObjects.flat;
  const accidentalPath = new fabric.Path(accidentalObject.path);
  let { xPos: left, yPos: top } = drawingHelpers.getAccidentalPosition({
    scaledCursorPosition: cursorPosition + staff.xPos,
    pitch,
    staff
    });
  left += accidentalObject.translateX * staff.scale;
  top += accidentalObject.translateY * staff.scale;
  accidentalPath.set({ left, top });
  accidentalPath.scale(accidentalObject.scaleFactor * staff.scale);

  // after positioning the accidental, the note must be shifted
  const notePositionDelta = accidentalObject.extraSpacing * staff.scale;
  notePath.set({
    left: notePath.left + notePositionDelta
  });

  return { accidentalPath, extraCursorMovement: notePositionDelta };
};
