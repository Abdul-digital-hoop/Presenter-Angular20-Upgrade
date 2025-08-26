import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleDonutComponent } from './multiple-donut.component';

describe('MultipleDonutComponent', () => {
  let component: MultipleDonutComponent;
  let fixture: ComponentFixture<MultipleDonutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleDonutComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleDonutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
