import { TestBed } from '@angular/core/testing';

import { MypresentationsService } from './mypresentations.service';

describe('MypresentationsService', () => {
  let service: MypresentationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MypresentationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
