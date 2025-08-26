import { TestBed } from '@angular/core/testing';

import { TrashServiceService } from './trash-service.service';

describe('TrashServiceService', () => {
  let service: TrashServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrashServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
