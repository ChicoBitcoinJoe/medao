import { TestBed } from '@angular/core/testing';

import { MedaoService } from './medao.service';

describe('MedaoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MedaoService = TestBed.get(MedaoService);
    expect(service).toBeTruthy();
  });
});
