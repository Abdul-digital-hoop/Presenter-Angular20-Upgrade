import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnderconstructionComponent } from './underconstruction.component';

describe('UnderconstructionComponent', () => {
  let component: UnderconstructionComponent;
  let fixture: ComponentFixture<UnderconstructionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnderconstructionComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnderconstructionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
