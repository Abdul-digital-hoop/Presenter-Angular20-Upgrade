import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PresenterToolbarComponent } from './presenter-toolbar.component';

describe('PresenterToolbarComponent', () => {
  let component: PresenterToolbarComponent;
  let fixture: ComponentFixture<PresenterToolbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PresenterToolbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PresenterToolbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
