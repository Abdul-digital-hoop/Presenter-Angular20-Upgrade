import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatesHeaderComponent } from './templates-header.component';

describe('TemplatesHeaderComponent', () => {
  let component: TemplatesHeaderComponent;
  let fixture: ComponentFixture<TemplatesHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplatesHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplatesHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
