import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleBarComponent } from './multiple-bar.component';

describe('MultipleBarComponent', () => {
  let component: MultipleBarComponent;
  let fixture: ComponentFixture<MultipleBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleBarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
