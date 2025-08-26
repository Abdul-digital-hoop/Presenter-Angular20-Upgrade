import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TruthOrLieComponent } from './truth-or-lie.component';

describe('TruthOrLieComponent', () => {
  let component: TruthOrLieComponent;
  let fixture: ComponentFixture<TruthOrLieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TruthOrLieComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TruthOrLieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
