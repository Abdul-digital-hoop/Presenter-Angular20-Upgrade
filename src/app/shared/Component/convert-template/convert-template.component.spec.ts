import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConvertTemplateComponent } from './convert-template.component';

describe('ConvertTemplateComponent', () => {
  let component: ConvertTemplateComponent;
  let fixture: ComponentFixture<ConvertTemplateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConvertTemplateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConvertTemplateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
