import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableImageModalComponent } from './reusable-image-modal.component';

describe('ReusableImageModalComponent', () => {
  let component: ReusableImageModalComponent;
  let fixture: ComponentFixture<ReusableImageModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReusableImageModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusableImageModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
