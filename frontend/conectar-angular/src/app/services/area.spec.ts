import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AreaService } from './area';

describe('AreaService', () => {
  let service: AreaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(AreaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
