import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PsalmVerseComponent } from './psalm-verse.component';

describe('PsalmVerseComponent', () => {
  let component: PsalmVerseComponent;
  let fixture: ComponentFixture<PsalmVerseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PsalmVerseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PsalmVerseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
