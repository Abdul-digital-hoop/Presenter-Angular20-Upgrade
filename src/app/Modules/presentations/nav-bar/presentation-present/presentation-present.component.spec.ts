import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresentationPresentComponent } from './presentation-present.component';

describe('PresentationPresentComponent', () => {
  let component: PresentationPresentComponent;
  let fixture: ComponentFixture<PresentationPresentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresentationPresentComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresentationPresentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
