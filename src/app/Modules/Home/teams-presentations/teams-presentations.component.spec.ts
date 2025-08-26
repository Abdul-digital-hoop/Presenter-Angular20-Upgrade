import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamsPresentationsComponent } from './teams-presentations.component';

describe('TeamsPresentationsComponent', () => {
  let component: TeamsPresentationsComponent;
  let fixture: ComponentFixture<TeamsPresentationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TeamsPresentationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamsPresentationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
