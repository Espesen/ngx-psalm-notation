import { Staff } from './../../staff/staff';
import { SVGObjects } from './../svg-objects';
import { fabric } from 'fabric';

type arguments = {
  staff: Staff,
  cursorPosition: number
};

type returnValue = {
  halfBarlinePath: fabric.Path
};

export const drawHalfBarline = (options: arguments): returnValue => {

  const { staff, cursorPosition } = options;
  const halfBarlineObject = SVGObjects.halfBarline;
  const halfBarlinePath = new fabric.Path(halfBarlineObject.path);

  let left = cursorPosition + staff.xPos;
  let top = staff.yPos;
  left += halfBarlineObject.translateX * staff.scale;
  top += halfBarlineObject.translateY * staff.scale;
  halfBarlinePath.set({ left, top });
  halfBarlinePath.scale(halfBarlineObject.scaleFactor * staff.scale);

  return { halfBarlinePath };
};
