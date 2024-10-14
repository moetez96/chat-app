import { TestBed } from '@angular/core/testing';

import { ContactsHandlerService } from './contacts-handler.service';

describe('ContactsHandlerService', () => {
  let service: ContactsHandlerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContactsHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
