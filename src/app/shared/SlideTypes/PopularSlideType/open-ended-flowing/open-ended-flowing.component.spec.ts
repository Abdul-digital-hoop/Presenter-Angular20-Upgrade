import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenEndedFlowingComponent } from './open-ended-flowing.component';

describe('OpenEndedFlowingComponent', () => {
  let component: OpenEndedFlowingComponent;
  let fixture: ComponentFixture<OpenEndedFlowingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OpenEndedFlowingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OpenEndedFlowingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
