import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuessTheNumberQuizComponent } from './guess-the-number-quiz.component';

describe('GuessTheNumberQuizComponent', () => {
  let component: GuessTheNumberQuizComponent;
  let fixture: ComponentFixture<GuessTheNumberQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuessTheNumberQuizComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuessTheNumberQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
