import { TestBed } from '@angular/core/testing';

import { DaiService } from './dai.service';

describe('DaiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DaiService = TestBed.get(DaiService);
    expect(service).toBeTruthy();
  });
});
