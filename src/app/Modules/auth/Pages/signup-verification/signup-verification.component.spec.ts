import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupVerificationComponent } from './signup-verification.component';

describe('SignupVerificationComponent', () => {
  let component: SignupVerificationComponent;
  let fixture: ComponentFixture<SignupVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SignupVerificationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
