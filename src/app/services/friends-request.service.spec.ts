import { TestBed } from '@angular/core/testing';
import {FriendsRequestService} from "./friends-request.service";


describe('FriendsRequestService', () => {
  let service: FriendsRequestService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FriendsRequestService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
