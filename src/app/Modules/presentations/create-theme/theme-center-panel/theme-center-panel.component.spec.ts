import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeCenterPanelComponent } from './theme-center-panel.component';

describe('ThemeCenterPanelComponent', () => {
  let component: ThemeCenterPanelComponent;
  let fixture: ComponentFixture<ThemeCenterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThemeCenterPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeCenterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
