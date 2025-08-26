import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeRightSideBarComponent } from './theme-right-side-bar.component';

describe('ThemeRightSideBarComponent', () => {
  let component: ThemeRightSideBarComponent;
  let fixture: ComponentFixture<ThemeRightSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThemeRightSideBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeRightSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
