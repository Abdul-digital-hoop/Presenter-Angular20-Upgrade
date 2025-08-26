import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeNameComponentComponent } from './theme-name-component.component';

describe('ThemeNameComponentComponent', () => {
  let component: ThemeNameComponentComponent;
  let fixture: ComponentFixture<ThemeNameComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThemeNameComponentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThemeNameComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
