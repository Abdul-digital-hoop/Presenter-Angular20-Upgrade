import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonPreviewComponent } from './common-preview.component';

describe('CommonPreviewComponent', () => {
  let component: CommonPreviewComponent;
  let fixture: ComponentFixture<CommonPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
