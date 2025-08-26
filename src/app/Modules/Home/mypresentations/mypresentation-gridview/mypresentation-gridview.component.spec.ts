import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MypresentationGridviewComponent } from './mypresentation-gridview.component';

describe('MypresentationGridviewComponent', () => {
  let component: MypresentationGridviewComponent;
  let fixture: ComponentFixture<MypresentationGridviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MypresentationGridviewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MypresentationGridviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
