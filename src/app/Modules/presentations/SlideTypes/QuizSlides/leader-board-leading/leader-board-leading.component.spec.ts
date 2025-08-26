import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderBoardLeadingComponent } from './leader-board-leading.component';

describe('LeaderBoardLeadingComponent', () => {
  let component: LeaderBoardLeadingComponent;
  let fixture: ComponentFixture<LeaderBoardLeadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaderBoardLeadingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaderBoardLeadingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
