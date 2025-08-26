import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReusableImageUploadComponent } from './reusable-image-upload.component';

describe('ReusableImageUploadComponent', () => {
  let component: ReusableImageUploadComponent;
  let fixture: ComponentFixture<ReusableImageUploadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReusableImageUploadComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReusableImageUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
