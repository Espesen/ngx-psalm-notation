import { LedgerLine } from './drawing-helpers';
import { Staff } from './../staff/staff';
import { fabric } from 'fabric';
import { drawing } from './drawing';

export class NotationCanvas {

  canvas: fabric.StaticCanvas;

  currentWidth: number;

  constructor(elem: HTMLCanvasElement) {
    this.canvas = new fabric.StaticCanvas(elem);
  }

  clear(): void {
    this.canvas.clear();
  }

  setDimensions(width: number, height: number ): void {
    this.canvas.setDimensions({ width, height });
    this.currentWidth = width;
  }

  getWidth(): number {
    return this.currentWidth;
  }

  renderSystem(staff: Staff): void {

    const addObjects = (arg: fabric.Object | fabric.Object[]) => {
      if (arg instanceof fabric.Object) {
        this.canvas.add(arg);
      } else {
        arg.forEach(object => this.canvas.add(object));
      }
    };

    const addLedgerLines = (lines: LedgerLine[]): void => {
      lines.forEach(line => this.canvas.add(new fabric.Line(
        [ line.xPos, line.yPos, line.xPos + line.width, line.yPos ],
        { stroke: 'black' }
      )));
    };

    addObjects(drawing.drawStaffLines(staff));
    addObjects(drawing.drawClef(staff));
    const { fabricObjects, ledgerLines, finalCursorPosition } = drawing.drawObjects(staff, 30);
    if (finalCursorPosition < staff.width ) {
      addObjects(fabricObjects);
      addLedgerLines(ledgerLines);
    } else {
      console.log('Does not fit!');
    }

  }

}
