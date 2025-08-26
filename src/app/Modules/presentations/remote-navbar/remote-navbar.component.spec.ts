import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteNavbarComponent } from './remote-navbar.component';

describe('RemoteNavbarComponent', () => {
  let component: RemoteNavbarComponent;
  let fixture: ComponentFixture<RemoteNavbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoteNavbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
