import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScalesSliderComponent } from './scales-slider.component';

describe('ScalesSliderComponent', () => {
  let component: ScalesSliderComponent;
  let fixture: ComponentFixture<ScalesSliderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ScalesSliderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ScalesSliderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
