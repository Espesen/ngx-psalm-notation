import { Accidental } from './../symbol/attached-object';
import { parsePitch } from './../symbol/note-pitch';
import { AttachedObject } from '../symbol/attached-object';
import { notationDefaultValues } from './../default-values';
import { Note } from './../symbol/symbol';

type staffObjectType = 'note' | 'accidental' | 'halfBarline';

export class StaffObject {

  xPos: number;
  yPos: number;
  attachedObjects: AttachedObject[] = [];

  constructor(public type: staffObjectType) {}

  setPosition: (x: number, y: number) => void = (x, y) => {
    this.xPos = x;
    this.yPos = y;
  }

  attachObject(attachment: AttachedObject): StaffObject {
    this.attachedObjects.push(attachment);
    return this;
  }

}

export class StaffNote extends StaffObject {

  constructor(public note: Note) {
    super('note');
    const accidental = parsePitch(note.pitch).accidental;
    if (accidental) {
      this.attachObject(new Accidental(accidental === '#' ? 'sharp' : 'flat'));
    }
  }

}

export class HalfBarline extends StaffObject {
  constructor() {
    super('halfBarline');
  }
}

export class Staff {

  xPos: number = notationDefaultValues.staff.xPos;
  yPos: number = notationDefaultValues.staff.yPos;
  width: number = notationDefaultValues.staff.width;
  scale: number = notationDefaultValues.staff.scale;
  objects: StaffObject[] = [];

  constructor(
    // readonly parentCanvas: fabric.StaticCanvas
    ) {}

  setPosition(x: number, y: number): Staff {
    this.xPos = x;
    this.yPos = y;
    return this;
  }

  setDimensions(width: number, scale: number): Staff {
    this.width = width;
    this.scale = scale;
    return this;
  }

  getLineSpacing(): number {
    return notationDefaultValues.staffLineSpacing * this.scale;
  }

  addObject(obj: StaffObject): void {
    this.objects.push(obj);
  }

}
