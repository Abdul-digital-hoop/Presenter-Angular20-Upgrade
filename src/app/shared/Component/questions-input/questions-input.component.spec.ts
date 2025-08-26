import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionsInputComponent } from './questions-input.component';

describe('QuestionsInputComponent', () => {
  let component: QuestionsInputComponent;
  let fixture: ComponentFixture<QuestionsInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuestionsInputComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionsInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
