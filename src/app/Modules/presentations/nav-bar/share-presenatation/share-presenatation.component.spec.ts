import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePresenatationComponent } from './share-presenatation.component';

describe('SharePresenatationComponent', () => {
  let component: SharePresenatationComponent;
  let fixture: ComponentFixture<SharePresenatationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SharePresenatationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SharePresenatationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
