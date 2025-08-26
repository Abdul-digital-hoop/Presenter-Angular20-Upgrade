import { TestBed } from '@angular/core/testing';

import { CustomerPlanService } from './customer-plan.service';

describe('CustomerPlanService', () => {
  let service: CustomerPlanService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerPlanService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
