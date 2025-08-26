import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TypeAnswersComponent } from './type-answers.component';

describe('TypeAnswersComponent', () => {
  let component: TypeAnswersComponent;
  let fixture: ComponentFixture<TypeAnswersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TypeAnswersComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TypeAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
