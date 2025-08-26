import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportGoogleSlideComponent } from './import-google-slide.component';

describe('ImportGoogleSlideComponent', () => {
  let component: ImportGoogleSlideComponent;
  let fixture: ComponentFixture<ImportGoogleSlideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportGoogleSlideComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportGoogleSlideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
