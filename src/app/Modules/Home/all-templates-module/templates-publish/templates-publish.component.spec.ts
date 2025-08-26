import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplatesPublishComponent } from './templates-publish.component';

describe('TemplatesPublishComponent', () => {
  let component: TemplatesPublishComponent;
  let fixture: ComponentFixture<TemplatesPublishComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TemplatesPublishComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplatesPublishComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
