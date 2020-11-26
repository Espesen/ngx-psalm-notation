import { parsePitch } from './../../symbol/note-pitch';
import { Staff } from './../../staff/staff';
import { drawingHelpers } from './../drawing-helpers';
import { SVGObjects } from './../svg-objects';
import { fabric } from 'fabric';

type arguments = {
  staff: Staff,
  cursorPosition: number,
  notePitch: string
};

type returnValue = {
  accentPath: fabric.Path,
  extraCursorMovement: number;
};

export const drawAccent = (options: arguments): returnValue => {

  const { staff, notePitch: pitch, cursorPosition } = options;
  const accentObject = SVGObjects.accent;
  const accentPath = new fabric.Path(accentObject.path);
  const accidental = parsePitch(pitch).accidental;
  const shiftX = accidental ?
    accidental === '#' ? SVGObjects.sharp.extraSpacing : SVGObjects.flat.extraSpacing :
    0;

  let { xPos: left, yPos: top } = drawingHelpers.getAccentPosition({
    scaledCursorPosition: cursorPosition + staff.xPos,
    pitch,
    staff
    });
  left += accentObject.translateX * staff.scale + shiftX * staff.scale;
  top += accentObject.translateY * staff.scale;
  accentPath.set({ left, top });
  accentPath.scale(accentObject.scaleFactor * staff.scale);

  return { accentPath, extraCursorMovement: 0 };
};
