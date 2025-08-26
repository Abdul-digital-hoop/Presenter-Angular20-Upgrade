import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MypresentationHeaderComponent } from './mypresentation-header.component';

describe('MypresentationHeaderComponent', () => {
  let component: MypresentationHeaderComponent;
  let fixture: ComponentFixture<MypresentationHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MypresentationHeaderComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MypresentationHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
