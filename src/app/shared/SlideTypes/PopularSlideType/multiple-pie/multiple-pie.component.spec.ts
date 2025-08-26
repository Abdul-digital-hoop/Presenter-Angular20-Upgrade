import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiplePieComponent } from './multiple-pie.component';

describe('MultiplePieComponent', () => {
  let component: MultiplePieComponent;
  let fixture: ComponentFixture<MultiplePieComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MultiplePieComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultiplePieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
