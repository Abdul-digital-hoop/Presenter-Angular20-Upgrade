import { TestBed } from '@angular/core/testing';

import { PresentationThemeService } from './presentation-theme.service';

describe('PresentationThemeService', () => {
  let service: PresentationThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresentationThemeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
