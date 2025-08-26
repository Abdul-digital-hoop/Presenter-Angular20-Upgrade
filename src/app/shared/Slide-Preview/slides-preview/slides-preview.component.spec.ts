import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SlidesPreviewComponent } from './slides-preview.component';

describe('SlidesPreviewComponent', () => {
  let component: SlidesPreviewComponent;
  let fixture: ComponentFixture<SlidesPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SlidesPreviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlidesPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
