import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { Escalante } from './escalante';
import { ApiService } from '../../services/api.service';

describe('Escalante', () => {
  let component: Escalante;
  let fixture: ComponentFixture<Escalante>;
  let apiMock: {
    getMotoristas: ReturnType<typeof vi.fn>;
    getEscalas: ReturnType<typeof vi.fn>;
    criarEscala: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    apiMock = {
      getMotoristas: vi.fn().mockReturnValue(of([])),
      getEscalas: vi.fn().mockReturnValue(of([])),
      criarEscala: vi.fn().mockReturnValue(of({ ok: true }))
    };

    await TestBed.configureTestingModule({
      imports: [Escalante],
      providers: [{ provide: ApiService, useValue: apiMock }, provideRouter([])]
    })
      .compileComponents();

    fixture = TestBed.createComponent(Escalante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate required fields before saving', () => {
    component.novaEscala = {
      usuario_id: '',
      data: '',
      hora_inicio: '',
      hora_saida: '',
      saida: ''
    };

    component.salvarEscala();

    expect(component.erro).toBe('Preencha todos os campos da escala.');
    expect(apiMock.criarEscala).not.toHaveBeenCalled();
  });
});
