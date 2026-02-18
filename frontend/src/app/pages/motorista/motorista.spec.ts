import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Motorista } from './motorista';
import { ApiService } from '../../services/api.service';

describe('Motorista', () => {
  let component: Motorista;
  let fixture: ComponentFixture<Motorista>;
  let apiMock: { getEscalas: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    apiMock = {
      getEscalas: vi.fn().mockReturnValue(of([
        {
          id: 1,
          usuario_id: 2,
          data: '2026-02-18',
          hora_inicio: '07:00:00',
          hora_saida: '07:30:00',
          saida: 'Transporte Escolar'
        }
      ]))
    };

    await TestBed.configureTestingModule({
      imports: [Motorista],
      providers: [{ provide: ApiService, useValue: apiMock }, provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Motorista);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a next shift', () => {
    expect(component.proximaEscala).not.toBeNull();
    expect(component.proximaEscala?.saida).toBe('Transporte Escolar');
  });

  it('should render title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Painel do Motorista');
  });
});
