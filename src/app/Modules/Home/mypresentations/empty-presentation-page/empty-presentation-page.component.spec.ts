import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmptyPresentationPageComponent } from './empty-presentation-page.component';

describe('EmptyPresentationPageComponent', () => {
  let component: EmptyPresentationPageComponent;
  let fixture: ComponentFixture<EmptyPresentationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EmptyPresentationPageComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmptyPresentationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
