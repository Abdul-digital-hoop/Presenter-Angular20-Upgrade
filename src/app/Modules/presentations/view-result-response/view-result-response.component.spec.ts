import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewResultResponseComponent } from './view-result-response.component';

describe('ViewResultResponseComponent', () => {
  let component: ViewResultResponseComponent;
  let fixture: ComponentFixture<ViewResultResponseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewResultResponseComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewResultResponseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
