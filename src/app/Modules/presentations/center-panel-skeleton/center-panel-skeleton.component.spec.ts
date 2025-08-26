import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterPanelSkeletonComponent } from './center-panel-skeleton.component';

describe('CenterPanelSkeletonComponent', () => {
  let component: CenterPanelSkeletonComponent;
  let fixture: ComponentFixture<CenterPanelSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CenterPanelSkeletonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CenterPanelSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
