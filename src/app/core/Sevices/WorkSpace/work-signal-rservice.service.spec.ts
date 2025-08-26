import { TestBed } from '@angular/core/testing';

import { WorkSignalRServiceService } from './work-signal-rservice.service';

describe('WorkSignalRServiceService', () => {
  let service: WorkSignalRServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkSignalRServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
