import { TestBed } from '@angular/core/testing';

import { FriendsrequestService } from './friends-request.service';

describe('FriendsrequestService', () => {
  let service: FriendsrequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendsrequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
