import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Relatorios } from './relatorios';
import { ApiService } from '../../services/api.service';

describe('Relatorios', () => {
  let component: Relatorios;
  let fixture: ComponentFixture<Relatorios>;

  beforeEach(async () => {
    const apiMock = {
      getMotoristas: vi.fn().mockReturnValue(of([{ id: 2, nome: 'Simei Freitas' }])),
      getEscalas: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [Relatorios],
      providers: [{ provide: ApiService, useValue: apiMock }, provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(Relatorios);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

