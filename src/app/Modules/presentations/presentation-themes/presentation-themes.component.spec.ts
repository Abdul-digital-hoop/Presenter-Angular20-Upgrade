import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationThemesComponent } from './presentation-themes.component';

describe('PresentationThemesComponent', () => {
  let component: PresentationThemesComponent;
  let fixture: ComponentFixture<PresentationThemesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresentationThemesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentationThemesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
