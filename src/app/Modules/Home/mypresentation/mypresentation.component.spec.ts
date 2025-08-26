import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MypresentationComponent } from './mypresentation.component';

describe('MypresentationComponent', () => {
  let component: MypresentationComponent;
  let fixture: ComponentFixture<MypresentationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MypresentationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MypresentationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
