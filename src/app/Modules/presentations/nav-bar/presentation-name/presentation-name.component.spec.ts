import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationNameComponent } from './presentation-name.component';

describe('PresentationNameComponent', () => {
  let component: PresentationNameComponent;
  let fixture: ComponentFixture<PresentationNameComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresentationNameComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentationNameComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
