import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteLeftbarComponent } from './remote-leftbar.component';

describe('RemoteLeftbarComponent', () => {
  let component: RemoteLeftbarComponent;
  let fixture: ComponentFixture<RemoteLeftbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoteLeftbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteLeftbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
