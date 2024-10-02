import { TestBed } from '@angular/core/testing';

import { FriendRequestHandlerService } from './friend-request-handler.service';

describe('FriendRequestHandlerService', () => {
  let service: FriendRequestHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendRequestHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
