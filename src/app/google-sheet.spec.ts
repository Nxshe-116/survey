import { TestBed } from '@angular/core/testing';

import { GoogleSheet } from './google-sheet';

describe('GoogleSheet', () => {
  let service: GoogleSheet;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoogleSheet);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
