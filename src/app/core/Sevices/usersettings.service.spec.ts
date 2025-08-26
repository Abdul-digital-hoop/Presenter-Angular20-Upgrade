import { TestBed } from '@angular/core/testing';

import { UsersettingsService } from './usersettings.service';

describe('UsersettingsService', () => {
  let service: UsersettingsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersettingsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
