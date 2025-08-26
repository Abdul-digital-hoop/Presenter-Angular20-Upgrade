import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaderboardChampionComponent } from './leaderboard-champion.component';

describe('LeaderboardChampionComponent', () => {
  let component: LeaderboardChampionComponent;
  let fixture: ComponentFixture<LeaderboardChampionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LeaderboardChampionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeaderboardChampionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
