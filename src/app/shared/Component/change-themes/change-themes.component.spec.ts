import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangeThemesComponent } from './change-themes.component';

describe('ChangeThemesComponent', () => {
  let component: ChangeThemesComponent;
  let fixture: ComponentFixture<ChangeThemesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChangeThemesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChangeThemesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
