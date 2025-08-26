import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopularTemplatesComponent } from './popular-templates.component';

describe('PopularTemplatesComponent', () => {
  let component: PopularTemplatesComponent;
  let fixture: ComponentFixture<PopularTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopularTemplatesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PopularTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
