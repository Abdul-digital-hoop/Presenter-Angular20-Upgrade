import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RightPanelTextComponent } from './right-panel-text.component';

describe('RightPanelTextComponent', () => {
  let component: RightPanelTextComponent;
  let fixture: ComponentFixture<RightPanelTextComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RightPanelTextComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RightPanelTextComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
