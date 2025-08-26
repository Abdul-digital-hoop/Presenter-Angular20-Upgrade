import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuessTheNumberComponent } from './guess-the-number.component';

describe('GuessTheNumberComponent', () => {
  let component: GuessTheNumberComponent;
  let fixture: ComponentFixture<GuessTheNumberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuessTheNumberComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuessTheNumberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
