import { TestBed } from '@angular/core/testing';

import { FriendsListHandlerService } from './friends-list-handler.service';

describe('FriendsListHandlerService', () => {
  let service: FriendsListHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendsListHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
