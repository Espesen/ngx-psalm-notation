import { NotationService } from './../notation-service/notation.service';
import { combineLatest, Observable, Subject, of } from 'rxjs';
import { NotationCanvas } from './../notation-service/canvas/notation-canvas';
import { AfterViewInit, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

import { startWith, takeUntil } from 'rxjs/operators';

export type psalmVerseComponentInput = {
  lyrics: string;
  melody: string;
  /** First value of the SVG canvas element width, defaults to 500 */
  initialCanvasWidth?: number;
};

@Component({
  selector: 'psalm-verse',
  templateUrl: './psalm-verse.component.html',
  styleUrls: ['./psalm-verse.component.scss']
})
export class PsalmVerseComponent implements AfterViewInit, OnDestroy {

  // TODO!! Handle situation when lyrics is null
  @Input() dataInput$: Observable<psalmVerseComponentInput>;
  @Input() canvasId: string;
  @Input() responsiveCanvasWidth$: Observable<number>;
  @Output() errors = new EventEmitter<ReturnType<NotationService['renderPsalmStaffs']>['errors']>();

  onDestroy$ = new Subject<void>();
  notationCanvas: NotationCanvas;

  constructor(
    private notationsService: NotationService
  ) { }

  renderNotes(options: { lyrics: string, melody: string, canvasWidth: number }): void {

    this.notationCanvas.clear();
    const { staffs, requiredHeight, errors } = this.notationsService.renderPsalmStaffs(options);

    if (staffs.length) {
      this.notationCanvas.setDimensions(options.canvasWidth, requiredHeight);
      staffs.forEach(staff => this.notationCanvas.renderSystem(staff));
    }
    this.errors.emit(errors);
  }

  ngAfterViewInit(): void {

    const canvasEl = document.getElementById(this.canvasId) as HTMLCanvasElement;
    this.notationCanvas = new NotationCanvas(canvasEl);
    const canvasWidth$ = this.responsiveCanvasWidth$ ?
      this.responsiveCanvasWidth$.pipe(startWith(0)) : of(0);

    combineLatest([ this.dataInput$, canvasWidth$ ]).pipe(takeUntil(this.onDestroy$))
      .subscribe(([ dataInput, canvasWidth ]: [ psalmVerseComponentInput, number]) => {
        const finalCanvasWidth = canvasWidth || dataInput.initialCanvasWidth || 500;
        console.log(canvasWidth, finalCanvasWidth);
        this.renderNotes({
          lyrics: dataInput.lyrics,
          melody: dataInput.melody,
          canvasWidth: finalCanvasWidth
        });
      });

  }

  ngOnDestroy(): void {
    this.onDestroy$.next();
  }

}
