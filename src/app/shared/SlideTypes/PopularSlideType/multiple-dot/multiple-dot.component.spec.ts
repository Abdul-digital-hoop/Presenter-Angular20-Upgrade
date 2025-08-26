import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleDotComponent } from './multiple-dot.component';

describe('MultipleDotComponent', () => {
  let component: MultipleDotComponent;
  let fixture: ComponentFixture<MultipleDotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultipleDotComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleDotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
