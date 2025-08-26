import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThisOrThatComponent } from './this-or-that.component';

describe('ThisOrThatComponent', () => {
  let component: ThisOrThatComponent;
  let fixture: ComponentFixture<ThisOrThatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ThisOrThatComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ThisOrThatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
