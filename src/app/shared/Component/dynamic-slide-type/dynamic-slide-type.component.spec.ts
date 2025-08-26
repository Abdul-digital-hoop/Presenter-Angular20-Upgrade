import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicSlideTypeComponent } from './dynamic-slide-type.component';

describe('DynamicSlideTypeComponent', () => {
  let component: DynamicSlideTypeComponent;
  let fixture: ComponentFixture<DynamicSlideTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DynamicSlideTypeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DynamicSlideTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
