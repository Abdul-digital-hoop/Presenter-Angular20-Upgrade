import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportPptComponent } from './import-ppt.component';

describe('ImportPptComponent', () => {
  let component: ImportPptComponent;
  let fixture: ComponentFixture<ImportPptComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportPptComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportPptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
