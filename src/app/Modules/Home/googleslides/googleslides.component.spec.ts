import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleslidesComponent } from './googleslides.component';

describe('GoogleslidesComponent', () => {
  let component: GoogleslidesComponent;
  let fixture: ComponentFixture<GoogleslidesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GoogleslidesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoogleslidesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
