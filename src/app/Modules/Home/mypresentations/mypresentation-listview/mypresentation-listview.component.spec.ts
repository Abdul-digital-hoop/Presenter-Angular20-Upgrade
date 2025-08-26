import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MypresentationListviewComponent } from './mypresentation-listview.component';

describe('MypresentationListviewComponent', () => {
  let component: MypresentationListviewComponent;
  let fixture: ComponentFixture<MypresentationListviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MypresentationListviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MypresentationListviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
