import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MypresentationsComponent } from './mypresentations.component';

describe('MypresentationsComponent', () => {
  let component: MypresentationsComponent;
  let fixture: ComponentFixture<MypresentationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MypresentationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MypresentationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
