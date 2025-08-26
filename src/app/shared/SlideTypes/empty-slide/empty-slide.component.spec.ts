import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptySlideComponent } from './empty-slide.component';

describe('EmptySlideComponent', () => {
  let component: EmptySlideComponent;
  let fixture: ComponentFixture<EmptySlideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmptySlideComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptySlideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
