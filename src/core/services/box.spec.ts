import { TestBed } from '@angular/core/testing';

import { Box } from './box';

describe('Box', () => {
  let service: Box;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Box);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
