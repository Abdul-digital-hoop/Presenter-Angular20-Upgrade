import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationSettingComponent } from './presentation-setting.component';

describe('PresentationSettingComponent', () => {
  let component: PresentationSettingComponent;
  let fixture: ComponentFixture<PresentationSettingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresentationSettingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentationSettingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
