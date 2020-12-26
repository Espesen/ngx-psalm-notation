import { parsePitch } from './../../symbol/note-pitch';
import { Staff } from '../../staff/staff';
import { drawingHelpers } from '../drawing-helpers';
import { SVGObjects } from '../svg-objects';
import { fabric } from 'fabric';

type arguments = {
  staff: Staff,
  cursorPosition: number,
  notePitch: string,
  /** fabric.Path of the already drawn note */
  notePath: fabric.Path
};

type returnValue = {
  leftBracketPath: fabric.Path,
  rightBracketPath: fabric.Path,
  extraCursorMovement: number;
};

export const drawBrackets = (options: arguments): returnValue => {

  const { staff, notePitch: pitch, cursorPosition, notePath } = options;

  const objects = { leftBracket: SVGObjects.leftBracket, rightBracket: SVGObjects.rightBracket };
  const leftBracketPath = new fabric.Path(objects.leftBracket.path);
  const rightBracketPath = new fabric.Path(objects.rightBracket.path);
  const accidental = parsePitch(pitch).accidental;
  const rightBracketShiftX = accidental ?
    accidental === '#' ?
      SVGObjects.sharp.extraSpacing * staff.scale :
      SVGObjects.flat.extraSpacing * staff.scale :
    0;

  const positions: { [key: string]: { left: number, top: number }} = {};

  const setPosition = (positionKey: string) => {
    const positionFunction = positionKey === 'left' ?
      drawingHelpers.getLeftBracketPosition : drawingHelpers.getRightBracketPosition;
    const result = positionFunction({
      scaledCursorPosition: cursorPosition + staff.xPos,
      pitch,
      staff
    });
    positions[positionKey] = { left: result.xPos, top: result.yPos };
  };

  setPosition('left');
  setPosition('right');

  // let { xPos: left, yPos: top } = drawingHelpers.getAccidentalPosition({
  //
  //   pitch,
  //   staff
  //   });

  positions.left.left += objects.leftBracket.translateX * staff.scale;
  positions.left.top += objects.leftBracket.translateY * staff.scale;

  positions.right.left += objects.rightBracket.translateX * staff.scale + rightBracketShiftX;
  positions.right.top += objects.rightBracket.translateY * staff.scale;

  leftBracketPath.set({ left: positions.left.left, top: positions.left.top });
  leftBracketPath.scale(objects.leftBracket.scaleFactor * staff.scale);

  rightBracketPath.set({ left: positions.right.left, top: positions.right.top });
  rightBracketPath.scale(objects.rightBracket.scaleFactor * staff.scale);

  // after positioning the accidental, the note must be shifted
  const notePositionDelta = objects.leftBracket.extraSpacing * staff.scale;
  notePath.set({
    left: notePath.left + notePositionDelta
  });
  const extraCursorMovement = objects.leftBracket.extraSpacing * staff.scale +
    objects.rightBracket.extraSpacing * staff.scale;

  return { leftBracketPath, rightBracketPath, extraCursorMovement };
};
