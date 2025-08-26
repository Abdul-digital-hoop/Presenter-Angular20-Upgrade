import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatesEditComponent } from './templates-edit.component';

describe('TemplatesEditComponent', () => {
  let component: TemplatesEditComponent;
  let fixture: ComponentFixture<TemplatesEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplatesEditComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplatesEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
