import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RemoteCenterPanelComponent } from './remote-center-panel.component';

describe('RemoteCenterPanelComponent', () => {
  let component: RemoteCenterPanelComponent;
  let fixture: ComponentFixture<RemoteCenterPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RemoteCenterPanelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RemoteCenterPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
