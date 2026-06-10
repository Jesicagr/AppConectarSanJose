import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { ActividadService } from './actividad';

describe('ActividadService', () => {
  let service: ActividadService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });
    service = TestBed.inject(ActividadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
