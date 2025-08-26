import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteRightbarComponent } from './remote-rightbar.component';

describe('RemoteRightbarComponent', () => {
  let component: RemoteRightbarComponent;
  let fixture: ComponentFixture<RemoteRightbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoteRightbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteRightbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
