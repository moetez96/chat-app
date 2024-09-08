import { TestBed } from '@angular/core/testing';

import { ConverastionService } from './conversation.service';

describe('ConverastionService', () => {
  let service: ConverastionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConverastionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
