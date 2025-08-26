import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreviewPresentationComponent } from './preview-presentation.component';

describe('PreviewPresentationComponent', () => {
  let component: PreviewPresentationComponent;
  let fixture: ComponentFixture<PreviewPresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PreviewPresentationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreviewPresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
