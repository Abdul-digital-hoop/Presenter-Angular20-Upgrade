import { TestBed } from '@angular/core/testing';

import { PresenterToolbarService } from './presenter-toolbar.service';

describe('PresenterToolbarService', () => {
  let service: PresenterToolbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PresenterToolbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
