import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SaveMoreComponent } from './save-more.component';

describe('SaveMoreComponent', () => {
  let component: SaveMoreComponent;
  let fixture: ComponentFixture<SaveMoreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SaveMoreComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SaveMoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
