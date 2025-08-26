import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportPowerpointComponent } from './import-powerpoint.component';

describe('ImportPowerpointComponent', () => {
  let component: ImportPowerpointComponent;
  let fixture: ComponentFixture<ImportPowerpointComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ImportPowerpointComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportPowerpointComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
