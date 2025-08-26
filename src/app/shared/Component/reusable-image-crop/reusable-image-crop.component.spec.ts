import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableImageCropComponent } from './reusable-image-crop.component';

describe('ReusableImageCropComponent', () => {
  let component: ReusableImageCropComponent;
  let fixture: ComponentFixture<ReusableImageCropComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReusableImageCropComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusableImageCropComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
