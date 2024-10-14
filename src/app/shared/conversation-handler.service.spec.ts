import { TestBed } from '@angular/core/testing';
import {ConversationHandlerService} from "./conversation-handler.service";


describe('ConversationHandlerService', () => {
  let service: ConversationHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversationHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
