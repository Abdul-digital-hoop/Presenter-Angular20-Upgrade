import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectAnswersComponent } from './select-answers.component';

describe('SelectAnswersComponent', () => {
  let component: SelectAnswersComponent;
  let fixture: ComponentFixture<SelectAnswersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectAnswersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
